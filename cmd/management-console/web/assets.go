//goa:generate bash -c "npm run build"
//go:generate vfsgendev -source="github.com/sourcegraph/sourcegraph/cmd/management-console/web".Assets

package web

import (
	"net/http"
	"os"
	"path/filepath"
)

// Assets contains the bundled web assets
var Assets http.FileSystem = http.Dir("dist/")

func init() {
	if projectRoot := os.Getenv("PROJECT_ROOT"); projectRoot != "" {
		Assets = http.Dir(filepath.Join(projectRoot, "web/dist"))
	}
}
