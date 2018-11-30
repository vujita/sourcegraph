package conf

import "github.com/sourcegraph/sourcegraph/pkg/conf/conftypes"

// TODO(slimsag): validate configs

// TODO(slimsag): Unified

// defaultDevAndTestingConfiguration is the default configuration applied to
// dev instances of Sourcegraph, as well as what is used by default during
// Go testing.
//
// Tests that wish to use a specific configuration should use conf.Mock.
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
