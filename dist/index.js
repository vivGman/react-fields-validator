'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));
var ReactDOM = _interopDefault(require('react-dom'));
var PropTypes = _interopDefault(require('prop-types'));

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var ValidatorCore = function (_React$Component) {
  inherits(ValidatorCore, _React$Component);

  /* LIFECYCLE */

  function ValidatorCore(props) {
    classCallCheck(this, ValidatorCore);

    var _this = possibleConstructorReturn(this, (ValidatorCore.__proto__ || Object.getPrototypeOf(ValidatorCore)).call(this, props));

    _this.state = {
      value: _this.props.value === undefined ? _this.props.defaultValue : _this.props.value,
      checked: _this.props.value === undefined ? _this.props.defaultValue : _this.props.value,
      messages: [],
      isValid: true,
      hasError: false
    };

    _this.props.onValidateForm.validators = _this.props.onValidateForm.validators || [];
    return _this;
  }

  createClass(ValidatorCore, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.value !== nextProps.value) {
        this.setState({
          value: nextProps.value
        });
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.props.onValidateForm.validators.push(this);
      this.props.onValidateForm.panic = function () {
        var results = _this2.props.onValidateForm.validators.map(function (instance) {
          return instance.panic();
        });
        return results.every(function (isTrue) {
          return isTrue;
        });
      };
      this.props.onValidateForm.check = function () {
        var results = _this2.props.onValidateForm.validators.map(function (instance) {
          return !instance.hasError;
        });
        return results.every(function (isTrue) {
          return isTrue;
        });
      };

      if (this.props.enableEventListeners) {
        var domNode = ReactDOM.findDOMNode(this);

        domNode.addEventListener('change', function (ev) {
          return _this2._onChange(ev);
        }, {
          capture: true
        });
        domNode.addEventListener('focus', function (ev) {
          return _this2._onFocus(ev);
        }, {
          capture: true
        });
        domNode.addEventListener('blur', function (ev) {
          return _this2._onBlur(ev);
        }, {
          capture: true
        });
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var index = this.props.onValidateForm.validators.indexOf(this);
      this.props.onValidateForm.validators.splice(index, 1);
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps, nextState) {
      var _this3 = this;

      var state = {
        isValid: true,
        messages: nextState.messages,
        hasError: false
      };
      var needUpdate = false;

      if (!this.props.bool && !this.state[this._valueProp] && nextProps.value !== this.state[this._valueProp]) {
        needUpdate = true;
        state.messages = this._checkErrors(nextProps.value);
        state.value = nextProps.value;

        state.isValid = !state.messages.length;
        // console.log(1, state.messages)
      }

      // if (nextState[this._valueProp] !== this.state[this._valueProp]) {
      //   console.log('change')
      //   needUpdate = true;
      //   state.messages = this._checkErrors(nextState[this._valueProp]); 

      //   if (nextState.hasFocus) {
      //     state.isValid = true;
      //     state.hasError = false;
      //   } else {
      //     state.isValid = !state.messages.length;
      //   }
      // }

      if (nextState.hasFocus !== this.state.hasFocus || nextState[this._valueProp] !== this.state[this._valueProp]) {
        needUpdate = true;
        state.messages = this._checkErrors(nextState[this._valueProp]);

        if (nextState.hasFocus) {
          state.isValid = !state.messages.length;
          state.hasError = false;
        } else {
          state.isValid = !state.messages.length;
          state.hasError = !state.isValid;
        }
        // console.log(3, state.messages)
      }

      if (needUpdate) {
        var _state$messages$reduc = state.messages.reduce(function (result, item) {
          if (typeof item === 'string') {
            result.messages.push(item);
          } else {
            if (item instanceof Object && item.promise instanceof Promise) {
              result.promises.push(item);
            }
          }
          return result;
        }, { messages: [], promises: [] }),
            messages = _state$messages$reduc.messages,
            promises = _state$messages$reduc.promises;

        if (promises.length) {
          Promise.all(promises.map(function (item) {
            return item.promise;
          })).then(function (responses) {
            var _messages = _this3.state.messages.concat(responses.map(function (valid, index) {
              return valid ? true : promises[index].message;
            }).filter(function (message) {
              return typeof message === 'string';
            }));

            var isValid = _messages.length === 0;
            var hasError = !_this3.state.hasFocus && !isValid;

            // console.log('async', isValid, _messages)

            _this3.setState({
              isValid: isValid,
              messages: _messages,
              hasError: hasError
            }, function () {
              _this3.props.onValidate(state);
            });
          });
        }

        state.messages = messages;

        // console.log('sync', state.isValid, state.messages)

        this.setState(state, function () {
          _this3.props.onValidate(state);
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return this.props.render(this.state);
    }

    /* PUBLIC */

  }, {
    key: 'panic',
    value: function panic() {
      var _this4 = this;

      var state = {
        isValid: true,
        messages: this.state.messages,
        hasError: false
      };

      if (this._valueProp === 'checked') ;

      state.messages = this._checkErrors(this.state[this._valueProp]);
      state.isValid = !state.messages.length;
      state.hasError = !state.isValid;

      this.setState(state, function () {
        _this4.props.onValidateForm(state);
        _this4.props.onValidate(state);
      });

      return !state.hasError;
    }
  }, {
    key: '_onChange',


    /* PRIVATE */

    value: function _onChange(ev) {
      this.setState({
        isChanged: true,
        value: this.props.hasOwnProperty('value') ? this.props.value : ev.target.value,
        checked: this.props.hasOwnProperty('checked') ? this.props.checked : ev.target.checked
      });
    }
  }, {
    key: '_onFocus',
    value: function _onFocus(ev) {
      this.setState({
        hasFocus: true
      });
    }
  }, {
    key: '_onBlur',
    value: function _onBlur(ev) {
      this.setState({
        isChanged: true,
        hasFocus: false
      });
    }
  }, {
    key: '_checkErrors',
    value: function _checkErrors(value) {
      var _this5 = this;

      var isRequired = this.props.validators.includes('isRequired');
      var validators = [];
      var errors = [];

      this.props.validators.forEach(function (methodName) {

        if (typeof methodName === 'string' && _this5[methodName] && typeof _this5[methodName] === 'function') {
          validators.push({
            func: _this5[methodName],
            name: methodName,
            params: [],
            message: _this5[methodName + 'Error']
          });
        }

        if (typeof methodName === 'function') {
          validators.push({
            func: methodName,
            name: 'unknown',
            params: [],
            message: 'Error'
          });
        }

        if ((typeof methodName === 'undefined' ? 'undefined' : _typeof(methodName)) === 'object') {
          var hash = methodName;
          var defaultFunc = typeof _this5[hash.name] === 'function' ? _this5[hash.name] : null;
          var func = hash.func || defaultFunc;
          if (func) {
            validators.push({
              func: func,
              name: hash.name || 'unknown',
              params: [].concat(hash.params || []),
              message: hash.message || _this5.props[methodName + 'Error'] || _this5[methodName + 'Error'] || 'Error'
            });
          }
        }
      });

      if (isRequired ? true : Boolean(value)) {
        validators.forEach(function (validator, index) {

          var result = validator.func.apply(_this5, [value].concat(validator.params));

          if (!result) {
            errors.push(validator.message);
          }

          if (result instanceof Promise) {
            var methodName = validator.name;
            errors.push(_extends({}, validator, {
              promise: result
            }));
          }
        });
      }

      return errors;
    }
  }, {
    key: 'hasError',
    get: function get$$1() {
      return this._checkErrors(this.state[this._valueProp]).length;
    }
  }, {
    key: 'errors',
    get: function get$$1() {
      return this.state.messages;
    }
  }, {
    key: '_valueProp',
    get: function get$$1() {
      if (this.props.bool) {
        return 'checked';
      } else {
        return 'value';
      }
    }
  }]);
  return ValidatorCore;
}(React.Component);

ValidatorCore.propTypes = {
  defaultValue: PropTypes.any
};
ValidatorCore.defaultProps = {
  enableEventListeners: true,
  bool: false,
  defaultValue: '',
  wrapper: 'div',
  validators: [],
  customValidator: function customValidator(value) {
    return true;
  },
  onValidateForm: function onValidateForm() {},
  onValidate: function onValidate() {},
  render: function render(props) {
    return null;
  }
};

var Validator = function (_ValidatorCore) {
  inherits(Validator, _ValidatorCore);

  function Validator() {
    var _ref;

    var _temp, _this, _ret;

    classCallCheck(this, Validator);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = Validator.__proto__ || Object.getPrototypeOf(Validator)).call.apply(_ref, [this].concat(args))), _this), _this.isRequiredError = 'This field is required', _this.isTextError = 'Value is not a string', _this.isNumberError = 'Value is not a number', _this.isUrlPathError = 'Value is not a path', _this.isUrlError = 'Value is not a url', _this.isEmailError = 'Value is not a email', _temp), possibleConstructorReturn(_this, _ret);
  }

  createClass(Validator, [{
    key: 'isRequired',
    value: function isRequired(value) {
      return Boolean(value);
    }
  }, {
    key: 'isText',
    value: function isText(value) {
      return typeof value === 'string';
    }
  }, {
    key: 'isNumber',
    value: function isNumber(value) {
      value = Number(value);
      return typeof value === 'number' && !isNaN(value);
    }
  }, {
    key: 'isUrl',
    value: function isUrl(value) {
      value = String(value);
      var reg = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm;
      return value.match(reg);
    }
  }, {
    key: 'isUrlPath',
    value: function isUrlPath(value) {
      value = String(value);
      var reg = /^(\/)([\w\-\.]+[^#?\s]+)([\w\-]*)?(#[\w\-]+)?$/g;
      return value.match(reg);
    }
  }, {
    key: 'isEmail',
    value: function isEmail(value) {
      value = String(value);
      var reg = /^[\d\w]+[\w\d._-]*@([\w\d-_]+\.)+[\w]{2,}$/i;
      return value.match(reg);
    }
  }, {
    key: 'isEq',
    value: function isEq(value, compareValue) {
      return String(value) === String(compareValue);
    }
  }, {
    key: 'lengthGtEq',
    value: function lengthGtEq(value, compareValue) {
      value = String(value);
      compareValue = Number(compareValue);
      return value.length >= compareValue;
    }
  }]);
  return Validator;
}(ValidatorCore);

module.exports = Validator;
//# sourceMappingURL=index.js.map
