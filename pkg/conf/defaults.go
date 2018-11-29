package conf

import "github.com/sourcegraph/sourcegraph/pkg/conf/conftypes"

// TODO(slimsag): validate configs

// TODO(slimsag): Unified
var defaultDevAndTestingConfiguration = conftypes.RawUnified{
	Critical: `{}`,
	Site:     `{}`,
}

// TODO(slimsag): Unified
var defaultDockerContainerConfiguration = conftypes.RawUnified{
	Critical: `{}`,
	Site:     `{}`,
}

// TODO(slimsag): Unified
var defaultClusterConfiguration = conftypes.RawUnified{
	Critical: `{}`,
	Site:     `{}`,
}
