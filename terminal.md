root@v471249:~/pepelab_program# ls
Anchor.toml  app  Cargo.lock  Cargo.toml  migrations  node_modules  package.json  programs  target  tests  yarn.lock
root@v471249:~/pepelab_program# cat Anchor.toml 
[toolchain]
package_manager = "yarn"

[features]
resolution = true
skip-lint = false

[programs.localnet]
pepelab_program = "FRDNP7o8zsdou6N8yajjL9fd6tAoy1wXj31e2HtnjUzz"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run mocha -t 1000000 tests/"
root@v471249:~/pepelab_program# anchor build
error: not a directory: '/root/.local/share/solana/install/releases/stable-0365999516681a394815488e42824e709111afeb/solana-release/bin/platform-tools-sdk/sbf/dependencies/platform-tools/rust/lib'
root@v471249:~/pepelab_program# # Deploy to devnet
anchor deploy --provider.cluster devnet

# Verify deployment
solana account $PROGRAM_ID --url devnet
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: /root/.config/solana/id.json
Deploying program "pepelab_program"...
Program path: /root/pepelab_program/target/deploy/pepelab_program.so...
Error: Dynamic program error: No default signer found, run "solana-keygen new -o /root/.config/solana/id.json" to create a new one
There was a problem deploying: Output { status: ExitStatus(unix_wait_status(256)), stdout: "", stderr: "" }.
Error: AccountNotFound: pubkey=FRDNP7o8zsdou6N8yajjL9fd6tAoy1wXj31e2HtnjUzz
root@v471249:~/pepelab_program# 