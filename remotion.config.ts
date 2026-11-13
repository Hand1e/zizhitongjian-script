import {Config} from '@remotion/cli/config';

// 统一输出设置，保证不同机器渲染结果一致。
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
