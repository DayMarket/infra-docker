package web

import (
	"bytes"
	"crypto/md5"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/drone/drone/core"
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
		r.Post("/", s.HandleHook())
	})

	r.Get("/version", s.HandleVersion())
	r.Get("/varz", s.HandleVarz())

	r.Handle("/login",
		s.Login.Handler(
			http.HandlerFunc(
				s.HandleLogin(),
			),
		),
	)

	r.Get("/logout", s.HandleLogout())
	r.Post("/logout", s.HandleLogout())

	fs := http.FileServer(http.Dir("/static"))
	fs = setupCache(fs)

	r.Handle("/static/*", http.StripPrefix("/static/", fs))
	r.NotFound(HandleIndex(fs, s.Host))

	return r
}

func (s Server) HandleHook() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}
}

func (s Server) HandleLogin() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/", http.StatusSeeOther)
	}
}

func (s Server) HandleLogout() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.SetCookie(w, &http.Cookie{
			Name:     "user_sess",
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			HttpOnly: true,
			Secure:   true,
		})
		http.Redirect(w, r, "/", http.StatusSeeOther)
	}
}

func (s Server) HandleVersion() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"version": "v2.22.0-custom",
		})
	}
}

func (s Server) HandleVarz() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status": "ok",
			"time":   time.Now().Format(time.RFC3339),
		})
	}
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
		if strings.Contains(path, ".") || strings.HasPrefix(path, "/static/") {
			fs.ServeHTTP(w, r)
			return
		}

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
