"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = WriteFileWebpackPlugin;

var _fs = _interopRequireDefault(require("fs"));

var _crypto = require("crypto");

var _path = _interopRequireDefault(require("path"));

var _lodash = _interopRequireDefault(require("lodash"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));

var _chalk = _interopRequireDefault(require("chalk"));

var _moment = _interopRequireDefault(require("moment"));

var _filesize = _interopRequireDefault(require("filesize"));

var _debug = _interopRequireDefault(require("debug"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug.default)('write-file-webpack-plugin');
/**
 * When 'webpack' program is used, constructor name is equal to 'NodeOutputFileSystem'.
 * When 'webpack-dev-server' program is used, constructor name is equal to 'MemoryFileSystem'.
 */

var isMemoryFileSystem = function isMemoryFileSystem(outputFileSystem) {
  return outputFileSystem.constructor.name === 'MemoryFileSystem';
};
/**
 * @typedef {Object} options
 * @property {boolean} exitOnErrors Stop writing files on webpack errors (default: true).
 * @property {boolean} force Forces the execution of the plugin regardless of being using `webpack-dev-server` or not (default: false).
 * @property {boolean} log Logs names of the files that are being written (or skipped because they have not changed) (default: true).
 * @property {RegExp} test A regular expression or function used to test if file should be written. When not present, all bundle will be written.
 * @property {boolean} useHashIndex Use hash index to write only files that have changed since the last iteration (default: true).
 */


function WriteFileWebpackPlugin() {
  var userOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var options = _lodash.default.assign({}, {
    exitOnErrors: true,
    force: false,
    log: true,
    test: null,
    useHashIndex: true
  }, userOptions);

  if (!_lodash.default.isBoolean(options.exitOnErrors)) {
    throw new TypeError('options.exitOnErrors value must be of boolean type.');
  }

  if (!_lodash.default.isBoolean(options.force)) {
    throw new TypeError('options.force value must be of boolean type.');
  }

  if (!_lodash.default.isBoolean(options.log)) {
    throw new TypeError('options.log value must be of boolean type.');
  }

  if (!_lodash.default.isNull(options.test) && !(_lodash.default.isRegExp(options.test) || _lodash.default.isFunction(options.test))) {
    throw new TypeError('options.test value must be an instance of RegExp or Function.');
  }

  if (!_lodash.default.isBoolean(options.useHashIndex)) {
    throw new TypeError('options.useHashIndex value must be of boolean type.');
  }

  var log = function log() {
    if (!options.log) {
      return;
    }

    for (var _len = arguments.length, append = new Array(_len), _key = 0; _key < _len; _key++) {
      append[_key] = arguments[_key];
    }

    debug.apply(void 0, [_chalk.default.dim('[' + (0, _moment.default)().format('HH:mm:ss') + '] [write-file-webpack-plugin]')].concat(append));
  };

  var assetSourceHashIndex = {};
  log('options', options);

  var apply = function apply(compiler) {
    var outputPath;
    var setupDone;
    var setupStatus;

    var setup = function setup() {
      if (setupDone) {
        return setupStatus;
      }

      setupDone = true;
      log('compiler.outputFileSystem is "' + _chalk.default.cyan(compiler.outputFileSystem.constructor.name) + '".');

      if (!isMemoryFileSystem(compiler.outputFileSystem) && !options.force) {
        return false;
      }

      if (_lodash.default.has(compiler, 'options.output.path') && compiler.options.output.path !== '/') {
        outputPath = compiler.options.output.path;
      }

      if (!outputPath) {
        throw new Error('output.path is not defined. Define output.path.');
      }

      log('outputPath is "' + _chalk.default.cyan(outputPath) + '".');
      setupStatus = true;
      return setupStatus;
    }; // eslint-disable-next-line promise/prefer-await-to-callbacks


    var handleAfterEmit = function handleAfterEmit(compilation, callback) {
      if (!setup()) {
        // eslint-disable-next-line promise/prefer-await-to-callbacks
        callback(new Error('write-file-webpack-plugin couldn\'t setup.'));
        return;
      }

      if (options.exitOnErrors && compilation.errors.length) {
        // eslint-disable-next-line promise/prefer-await-to-callbacks
        callback(compilation.errors);
        return;
      }

      log('compilation.errors.length is "' + _chalk.default.cyan(compilation.errors.length) + '".');

      _lodash.default.forEach(compilation.assets, function (asset, assetPath) {
        var outputFilePath = _path.default.isAbsolute(assetPath) ? assetPath : _path.default.join(outputPath, assetPath);

        var relativeOutputPath = _path.default.relative(process.cwd(), outputFilePath);

        var targetDefinition = 'asset: ' + _chalk.default.cyan('./' + assetPath) + '; destination: ' + _chalk.default.cyan('./' + relativeOutputPath);

        var test = options.test;

        if (test) {
          var skip = _lodash.default.isRegExp(test) ? !test.test(assetPath) : !test(assetPath);

          if (skip) {
            log(targetDefinition, _chalk.default.yellow('[skipped; does not match test]'));
            return;
          }
        }

        var assetSize = asset.size();
        var assetSource = Array.isArray(asset.source()) ? asset.source().join('\n') : asset.source();

        if (options.useHashIndex) {
          var assetSourceHash = (0, _crypto.createHash)('sha256').update(assetSource).digest('hex');

          if (assetSourceHashIndex[assetPath] && assetSourceHashIndex[assetPath] === assetSourceHash) {
            log(targetDefinition, _chalk.default.yellow('[skipped; matched hash index]'));
            return;
          }

          assetSourceHashIndex[assetPath] = assetSourceHash;
        }

        _mkdirp.default.sync(_path.default.dirname(relativeOutputPath));

        try {
          _fs.default.writeFileSync(relativeOutputPath.split('?')[0], assetSource);

          log(targetDefinition, _chalk.default.green('[written]'), _chalk.default.magenta('(' + (0, _filesize.default)(assetSize) + ')'));
        } catch (error) {
          log(targetDefinition, _chalk.default.bold.red('[is not written]'), _chalk.default.magenta('(' + (0, _filesize.default)(assetSize) + ')'));
          log(_chalk.default.bold.bgRed('Exception:'), _chalk.default.bold.red(error.message));
        }
      }); // eslint-disable-next-line promise/prefer-await-to-callbacks


      callback();
    };
    /**
     * webpack 4+ comes with a new plugin system.
     *
     * Check for hooks in-order to support old plugin system
     */


    if (compiler.hooks) {
      compiler.hooks.afterEmit.tapAsync('write-file-webpack-plugin', handleAfterEmit);
    } else {
      compiler.plugin('after-emit', handleAfterEmit);
    }
  };

  return {
    apply
  };
}
//# sourceMappingURL=WriteFileWebpackPlugin.js.map
