import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class ValidatorCore extends React.Component {

  static propTypes = {
    defaultValue: PropTypes.any
  };

  static defaultProps = {
    enableEventListeners: true,
    bool: false,
    defaultValue: '',
    wrapper: 'div',
    validators: [],
    customValidator(value) { return true },
    onValidateForm() {},
    onValidate() {},
    render(props) {
      return null
    }
  };

  /* LIFECYCLE */

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value === undefined ? this.props.defaultValue : this.props.value,
      checked: this.props.value === undefined ? this.props.defaultValue : this.props.value,
      messages: [],
      isValid: true,
      hasError: false,
    }

    this.props.onValidateForm.validators = this.props.onValidateForm.validators || [];
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({
        value: nextProps.value
      });
    }
  }

  componentDidMount() {
    this.props.onValidateForm.validators.push(this);
    this.props.onValidateForm.panic = () => {
      const results = this.props.onValidateForm.validators.map(instance => instance.panic());
      return results.every(isTrue => isTrue);
    };
    this.props.onValidateForm.check = () => {
      const results = this.props.onValidateForm.validators.map(instance => !instance.hasError);
      return results.every(isTrue => isTrue);
    };

    if (this.props.enableEventListeners) {
      const domNode = ReactDOM.findDOMNode(this);

      domNode.addEventListener('change', (ev) => this._onChange(ev), {
        capture: true,
      });
      domNode.addEventListener('focus', (ev) => this._onFocus(ev), {
        capture: true,
      });
      domNode.addEventListener('blur', (ev) => this._onBlur(ev), {
        capture: true,
      });
    }

  }

  componentDidUpdate(prevProps) {

    if (this.props.validators.length !== prevProps.validators.length) {
      this.panic(this.state.hasError);
      return;
    }

  }

  componentWillUnmount() {
    const index = this.props.onValidateForm.validators.indexOf(this);
    this.props.onValidateForm.validators.splice(index, 1);
  }

  componentWillUpdate(nextProps, nextState) {
    const state = {
      isValid: true,
      messages: nextState.messages,
      hasError: false
    };
    let needUpdate = false;

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
      const { messages, promises } = state.messages.reduce((result, item) => {
        if (typeof item === 'string') {
          result.messages.push(item);
        } else {
          if (item instanceof Object && item.promise instanceof Promise) {
            result.promises.push(item);
          }
        }
        return result;
      }, {messages:[], promises:[]});

      if (promises.length) {
        Promise.all(promises.map(item => item.promise)).then(responses => {
          const _messages = this.state.messages.concat(responses
            .map((valid, index) => {
              return valid ? true : promises[index].message
            })
            .filter(message => {
              return typeof message === 'string'
            }));

          const isValid = _messages.length === 0;
          const hasError = !this.state.hasFocus && !isValid;

          // console.log('async', isValid, _messages)

          this.setState({
            isValid: isValid,
            messages: _messages,
            hasError: hasError
          }, () => {
            this.props.onValidate(state);
          });
        })
      }

      state.messages = messages;

      // console.log('sync', state.isValid, state.messages)

      this.setState(state, () => {
        this.props.onValidate(state);
      });
    }


  }

  render() {
    return this.props.render(this.state);
  }

  /* PUBLIC */

  panic(setHasError=true) {
    let state = {
      isValid: true,
      messages: this.state.messages,
      hasError: false
    };

    if (this._valueProp === 'checked') {

    }

    state.messages = this._checkErrors(this.state[this._valueProp]); 
    state.isValid = !state.messages.length;
    if (setHasError) {
      state.hasError = !state.isValid;
    }

    this.setState(state, () => {
      this.props.onValidateForm(state);
      this.props.onValidate(state);
    });

    return !state.hasError;
  }

  get hasError() {
    return this._checkErrors(this.state[this._valueProp]).length; 
  }

  get errors() {
    return this.state.messages;
  }

  /* PRIVATE */

  _onChange(ev) {
    this.setState({ 
      isChanged: true, 
      value: this.props.hasOwnProperty('value') ? this.props.value : ev.target.value, 
      checked: this.props.hasOwnProperty('checked') ? this.props.checked : ev.target.checked 
    });
  }

  _onFocus(ev) {
    this.setState({ 
      hasFocus: true 
    })
  }

  _onBlur(ev) {
    this.setState({ 
      isChanged: true, 
      hasFocus: false 
    })
  }

  _checkErrors(value) {
    const isRequired = this.props.validators.includes('isRequired')
    let validators = [];
    let names = [];
    let params = [];
    let errors = [];
    const promises = [];

    this.props.validators.forEach(methodName => {
      let validator;

      if (typeof methodName === 'string' && this[methodName] && typeof this[methodName] === 'function') {
        validators.push({
          func: this[methodName],
          name: methodName,
          params: [],
          message: this[methodName + 'Error']
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

      if (typeof methodName === 'object') {
        const hash = methodName;
        const defaultFunc = typeof this[hash.name] === 'function' ? this[hash.name] : null
        const func = hash.func || defaultFunc;
        if (func) {
          validators.push({
            func: func,
            name: hash.name || 'unknown',
            params: [].concat(hash.params || []),
            message: hash.message || this.props[methodName + 'Error'] || this[methodName + 'Error'] || 'Error'
          });
        }
      }
    });

    if (isRequired ? true : Boolean(value)) {
      validators.forEach((validator, index) => {

        const result = validator.func.apply(this, [value].concat(validator.params))

        if (!result) {
          errors.push(validator.message);
        }

        if (result instanceof Promise) {
          const methodName = validator.name;
          errors.push({
            ...validator,
            promise: result
          });
        }
      });

      
    }

    return errors;
  }

  get _valueProp() {
    if (this.props.bool) {
      return 'checked';
    } else {
      return 'value';
    }
  }

}