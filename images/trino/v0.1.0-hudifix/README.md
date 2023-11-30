# Trino:hudifix

Image is built from <https://github.com/trinodb/trino/pull/18213>

1. `git clone https://github.com/trinodb/trino.git - Can't find link `
2. `cd trino`
3. `git fetch origin pull/18213/head:fix-hudi-instant-file-name-fetch`
4. `git checkout fix-hudi-instant-file-name-fetch`
5. `./mvnw clean install -DskipTests`
6. `cd core/docker/`
7. use predefined directory for workdir([L62-L63](./build.sh#L62-L63)) & comment out after [L73 in build.sh script](./build.sh#L73-L97). we will use this directory for workdir=)
8. `./build.sh -a amd64`
9. `tar -czvf /infra-docker/images/trino/trino-build`