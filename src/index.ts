import { TASK_NODE_GET_PROVIDER } from "hardhat/builtin-tasks/task-names";
import { extendConfig, extendEnvironment, subtask } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import {
  EthereumProvider,
  HardhatConfig,
  HardhatUserConfig,
} from "hardhat/types";
import path from "path";

import { ExampleHardhatRuntimeEnvironmentField } from "./ExampleHardhatRuntimeEnvironmentField";
import { precompile01 } from "./precompiles/01-random-bytes";
import { precompile02 } from "./precompiles/02-x25519-key-derivation";
import { precompile03 } from "./precompiles/03-deoxysii-seal";
import { precompile04 } from "./precompiles/04-deoxysii-open";
import { precompile05 } from "./precompiles/05-keypair-generate";
// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./type-extensions";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    // We apply our default config here. Any other kind of config resolution
    // or normalization should be placed here.
    //
    // `config` is the resolved config, which will be used during runtime and
    // you should modify.
    // `userConfig` is the config as provided by the user. You should not modify
    // it.
    //
    // If you extended the `HardhatConfig` type, you need to make sure that
    // executing this function ensures that the `config` object is in a valid
    // state for its type, including its extensions. For example, you may
    // need to apply a default value, like in this example.
    const userPath = userConfig.paths?.newPath;

    let newPath: string;
    if (userPath === undefined) {
      newPath = path.join(config.paths.root, "newPath");
    } else {
      if (path.isAbsolute(userPath)) {
        newPath = userPath;
      } else {
        // We resolve relative paths starting from the project's root.
        // Please keep this convention to avoid confusion.
        newPath = path.normalize(path.join(config.paths.root, userPath));
      }
    }

    config.paths.newPath = newPath;
  }
);

extendEnvironment((hre) => {
  // We add a field to the Hardhat Runtime Environment here.
  // We use lazyObject to avoid initializing things until they are actually
  // needed.
  hre.example = lazyObject(() => new ExampleHardhatRuntimeEnvironmentField());
});

subtask(TASK_NODE_GET_PROVIDER).setAction(
  async (
    args: {
      forkBlockNumber?: number;
      forkUrl?: string;
    },
    { artifacts, config, network, userConfig },
    runSuper
  ): Promise<EthereumProvider> => {
    const Precompiles = await import(
      "@nomicfoundation/ethereumjs-evm/dist/precompiles"
    );
    const getActivePrecompiles = Precompiles.getActivePrecompiles;
    Precompiles.getActivePrecompiles = (...args1) => {
      const activePrecompiles = getActivePrecompiles(...args1);
      activePrecompiles.set(
        "0100000000000000000000000000000000000001",
        precompile01
      );
      activePrecompiles.set(
        "0100000000000000000000000000000000000002",
        precompile02
      );
      activePrecompiles.set(
        "0100000000000000000000000000000000000003",
        precompile03
      );
      activePrecompiles.set(
        "0100000000000000000000000000000000000004",
        precompile04
      );
      activePrecompiles.set(
        "0100000000000000000000000000000000000005",
        precompile05
      );
      return activePrecompiles;
    };
    return runSuper();
  }
);
