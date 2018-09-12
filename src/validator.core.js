import React from 'react';
import PropTypes from 'prop-types';

export default class ValidatorCore extends React.Component {

  static propTypes = {
    defaultValue: PropTypes.any
  };

  static defaultProps = {
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
      value: this.props.value || this.props.defaultValue,
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
  }

  componentWillUnmount() {
    const index = this.props.onValidateForm.validators.indexOf(this);
    this.props.onValidateForm.validators.splice(index, 1);
  }

  componentWillUpdate(nextProps, nextState) {
    const [ messages, promises ] = nextState.messages.reduce((result, item, index, array) => {
      let [ messages, promises ] = result;
      
      if (item instanceof String) {
        messages.push(item);
      }

      if (item instanceof String) {
        messages.push(item);
      }

      return result;
    }, [[],[]]);

    const state = {
      isValid: true,
      messages: nextState.messages,
      hasError: false
    };
    let needUpdate = false;

    if (!this.props.bool && !this.state[this._valueProp] && nextProps.defaultValue !== this.state[this._valueProp]) {
      needUpdate = true;
      state.messages = this._checkErrors(nextProps.defaultValue); 
      state.value = nextProps.defaultValue;

      state.isValid = !state.messages.length;
    }

    if (nextState[this._valueProp] !== this.state[this._valueProp]) {
      needUpdate = true;
      state.messages = this._checkErrors(nextState[this._valueProp]); 

      if (nextState.hasFocus) {
        state.messages = [];
        state.isValid = true;
        state.hasError = false;
      } else {
        state.isValid = !state.messages.length;
      }
    }

    if (nextState.hasFocus !== this.state.hasFocus) {
      needUpdate = true;
      state.messages = this._checkErrors(nextState[this._valueProp]);

      if (nextState.hasFocus) {
        state.messages = [];
        state.isValid = true;
        state.hasError = false;
      } else {
        state.isValid = !state.messages.length;
        state.hasError = !state.isValid;
      }
    }

    if (needUpdate) {
      this.setState(state, () => {
        this.props.onValidate(state);
      });
    }
  }

  render() {
    const Wrapper = this.props.wrapper;
    return (
      <Wrapper 
        ref={el => this.el = el} 
        onChange={(ev) => this._onChange(ev)} 
        onFocus={(ev) => this._onFocus(ev)} 
        onBlur={(ev) => this._onBlur(ev)}
        className={this.props.className}>
        {this.props.render(this.state)}
      </Wrapper>
    )
  }

  /* PUBLIC */

  panic() {
    let state = {
      isValid: true,
      messages: this.state.messages,
      hasError: false
    };

    state.messages = this._checkErrors(this.state[this._valueProp]); 
    state.isValid = !state.messages.length;
    state.hasError = !state.isValid;

    let rect = this.el.getBoundingClientRect();

    
    setTimeout(() => {
      if (state.hasError && rect.y) {
        window.scrollTo(0, rect.y - 80);
      }
    }, 50)

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
      value: ev.target.value, 
      checked: ev.target.checked 
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

    this.props.validators.forEach(methodName => {
      let validator;

      if (typeof methodName === 'string' && this[methodName] && typeof this[methodName] === 'function') {
        validators.push(this[methodName]);
        names.push(methodName)
      }

      if (typeof methodName === 'function') {
        validators.push(methodName);
        names.push(void 0)
      }

      if (typeof methodName === 'object') {
        const hash = methodName;
        Object.keys(hash).forEach(methodName => {
          if (this[methodName] && typeof this[methodName] === 'function') {
            params[validators.length] = hash[methodName]
            names.push(methodName)
            validators.push(this[methodName]);
          }
        });
      }
    });

    if (isRequired ? true : Boolean(value)) {
      validators.forEach((validator, index) => {

        const result = validator(value, params[index])

        if (!result) {
          const methodName = names[index];
          const message = this.props[methodName + 'Error'] || this[methodName + 'Error'] || 'Error';
          errors.push(message);
        }

        if (result instanceof Promise) {
          errors.push(result);
        }

      });
    }

    this.errorNames= names;

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