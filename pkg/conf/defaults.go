package conf

import "github.com/sourcegraph/sourcegraph/pkg/conf/conftypes"

// TODO(slimsag): validate configs

// TODO(slimsag): Unified
var defaultDevAndTestingConfiguration = conftypes.RawUnified{
	Critical: `{}`,
	Site:     `{}`,
}

// TODO(slimsag): Unified
//
/*
	// The default site configuration.
	defaultSiteConfig := schema.SiteConfiguration{
		// TODO(slimsag): Unified
		//AuthProviders: []schema.AuthProviders{
		//	{Builtin: &schema.BuiltinAuthProvider{Type: "builtin"}},
		//},
		MaxReposToSearch: 50,

		DisablePublicRepoRedirects: true,
	}
*/
var defaultDockerContainerConfiguration = conftypes.RawUnified{
	Critical: `{}`,
	Site:     `{}`,
}

// TODO(slimsag): Unified
var defaultClusterConfiguration = conftypes.RawUnified{
	Critical: `{}`,
	Site:     `{}`,
}
