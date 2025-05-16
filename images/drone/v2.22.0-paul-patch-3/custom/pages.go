package web

import (
	"bytes"
	"crypto/md5"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/drone/drone/core"
)

func HandleIndex(host string, session core.Session, license core.LicenseService) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		user, _ := session.Get(r)
		if user == nil && r.URL.Path == "/" {
			http.Redirect(rw, r, "/welcome", 303)
			return
		}

		out, err := os.ReadFile("./static/index.html")
		if err != nil {
			http.Error(rw, "UI not found", http.StatusInternalServerError)
			return
		}

		ctx := r.Context()

		if ok, _ := license.Exceeded(ctx); ok {
			out = bytes.Replace(out, head, exceeded, -1)
		} else if license.Expired(ctx) {
			out = bytes.Replace(out, head, expired, -1)
		}

		rw.Header().Set("Content-Type", "text/html; charset=UTF-8")
		rw.Write(out)
	}
}

var (
	head     = []byte(`<head>`)
	expired  = []byte(`<head><script>window.LICENSE_EXPIRED=true</script>`)
	exceeded = []byte(`<head><script>window.LICENSE_LIMIT_EXCEEDED=true</script>`)
)

func setupCache(h http.Handler) http.Handler {
	data := []byte(time.Now().String())
	etag := fmt.Sprintf("%x", md5.Sum(data))

	return http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Cache-Control", "public, max-age=31536000")
			w.Header().Del("Expires")
			w.Header().Del("Pragma")
			w.Header().Set("ETag", etag)
			h.ServeHTTP(w, r)
		},
	)
}

var landingPage = `
`
