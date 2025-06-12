#!/bin/bash

set -eou pipefail

dirs=$(git tag -l --sort=v:refname | tail -n2 | xargs -L2 git diff --name-only --diff-filter=ACMR | xargs -L1 dirname | grep images | cut -d/ -f1-3 | uniq)

while IFS= read -r dir; do
	cd "$dir"
	pwd
 
	image=$(basename "$(dirname "$dir")")
	tag=$(basename "$dir")

  	docker build \
    	--build-arg NPM_AUTH_LINE="${NPM_AUTH_LINE:-}" \
        --tag "ghcr.io/daymarket/$image:$tag" \
        --tag "ghcr.io/daymarket/$image:latest" .

	docker push --all-tags ghcr.io/daymarket/$image

	cd - >/dev/null
done <<<"$dirs"
