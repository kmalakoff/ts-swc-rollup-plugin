"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return swc;
    }
});
var _gettsconfigcompat = /*#__PURE__*/ _interop_require_default(require("get-tsconfig-compat"));
var _tsswctransform = require("ts-swc-transform");
var _constants = require("./constants.js");
var _processcjs = /*#__PURE__*/ _interop_require_default(require("./lib/process.js"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function swc() {
    var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var tsconfig = _type_of(options.tsconfig) === 'object' ? options.tsconfig : _gettsconfigcompat.default.getTsconfig(options.cwd || _processcjs.default.cwd(), options.tsconfig || 'tsconfig.json');
    if (!tsconfig) throw new Error("tsconfig not found in: ".concat(options.cwd || _processcjs.default.cwd(), " named: ").concat(options.tsconfig || 'tsconfig.json'));
    var matcher = (0, _tsswctransform.createMatcher)(tsconfig);
    return {
        name: 'ts-swc',
        transform: function transform(code, id) {
            return (0, _tsswctransform.transformSync)(code, id, tsconfig);
        },
        resolveId: function resolveId(specifier, parentPath) {
            var context = {
                parentPath: parentPath
            };
            var filePath = (0, _tsswctransform.resolveFileSync)(specifier, context);
            if (!filePath) return null;
            if (!matcher(filePath)) return null;
            if (_constants.typeFileRegEx.test(filePath)) return null;
            return filePath;
        }
    };
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }