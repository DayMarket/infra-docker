package web

import (
	"bytes"
	"crypto/md5"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/drone/drone/core"
	"github.com/drone/drone/handler/web/link"
	"github.com/drone/drone/logger"
	"github.com/drone/go-login/login"
	"github.com/drone/go-scm/scm"

	chiprometheus "github.com/766b/chi-prometheus"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/unrolled/secure"
)

func New(
	admitter core.AdmissionService,
	builds core.BuildStore,
	client *scm.Client,
	hooks core.HookParser,
	license *core.License,
	licenses core.LicenseService,
	linker core.Linker,
	login login.Middleware,
	repos core.RepositoryStore,
	session core.Session,
	syncer core.Syncer,
	triggerer core.Triggerer,
	users core.UserStore,
	userz core.UserService,
	webhook core.WebhookSender,
	options secure.Options,
	system *core.System,
) Server {
	return Server{
		Admitter:  admitter,
		Builds:    builds,
		Client:    client,
		Hooks:     hooks,
		License:   license,
		Licenses:  licenses,
		Linker:    linker,
		Login:     login,
		Repos:     repos,
		Session:   session,
		Syncer:    syncer,
		Triggerer: triggerer,
		Users:     users,
		Userz:     userz,
		Webhook:   webhook,
		Options:   options,
		Host:      system.Host,
	}
}

type Server struct {
	Admitter  core.AdmissionService
	Builds    core.BuildStore
	Client    *scm.Client
	Hooks     core.HookParser
	License   *core.License
	Licenses  core.LicenseService
	Linker    core.Linker
	Login     login.Middleware
	Repos     core.RepositoryStore
	Session   core.Session
	Syncer    core.Syncer
	Triggerer core.Triggerer
	Users     core.UserStore
	Userz     core.UserService
	Webhook   core.WebhookSender
	Options   secure.Options
	Host      string
}

func (s Server) Handler() http.Handler {
	r := chi.NewRouter()
	m := chiprometheus.NewMiddleware("web")
	r.Use(m)
	r.Use(middleware.Recoverer)
	r.Use(middleware.NoCache)
	r.Use(logger.Middleware)
	r.Use(middleware.StripSlashes)

	sec := secure.New(s.Options)
	r.Use(sec.Handler)

	r.Route("/hook", func(r chi.Router) {
		r.Post("/", HandleHook(s.Repos, s.Builds, s.Triggerer, s.Hooks))
	})

	r.Get("/link/{namespace}/{name}/tree/*", link.HandleTree(s.Linker))
	r.Get("/link/{namespace}/{name}/src/*", link.HandleTree(s.Linker))
	r.Get("/link/{namespace}/{name}/commit/{commit}", link.HandleCommit(s.Linker))
	r.Get("/version", HandleVersion)
	r.Get("/varz", HandleVarz(s.Client, s.License))

	r.Handle("/login",
		s.Login.Handler(
			http.HandlerFunc(
				HandleLogin(
					s.Users,
					s.Userz,
					s.Syncer,
					s.Session,
					s.Admitter,
					s.Webhook,
				),
			),
		),
	)

	r.Get("/logout", HandleLogout())
	r.Post("/logout", HandleLogout())

	fs := http.FileServer(http.Dir("/static"))
	fs = setupCache(fs)

	// Serve all other routes with index.html (SPA fallback)
	r.NotFound(HandleIndex(fs, s.Host))

	return r
}

func setupCache(h http.Handler) http.Handler {
	data := []byte(time.Now().String())
	etag := fmt.Sprintf("%x", md5.Sum(data))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "public, max-age=31536000")
		w.Header().Del("Expires")
		w.Header().Del("Pragma")
		w.Header().Set("ETag", etag)
		h.ServeHTTP(w, r)
	})
}

func HandleIndex(fs http.Handler, host string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

		// Serve static assets directly (e.g. /static/*.js)
		if strings.Contains(path, ".") || strings.HasPrefix(path, "/static/") {
			fs.ServeHTTP(w, r)
			return
		}

		// Serve index.html with injected window.DRONE_* variables
		data, err := os.ReadFile("/static/index.html")
		if err != nil {
			http.Error(w, "index.html not found", http.StatusInternalServerError)
			return
		}

		script := fmt.Sprintf(`<script>
window.DRONE_SERVER="%s";
window.DRONE_SERVER_HOST="%s";
window.DRONE_SERVER_PORT="80";
window.DRONE_RPC_PROTO="http";
</script></head>`, host, host)

		patched := bytes.Replace(data, []byte("</head>"), []byte(script), 1)

		w.Header().Set("Content-Type", "text/html")
		w.Write(patched)
	}
}
