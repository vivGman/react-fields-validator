## Нестандартные валидации

```jsx
import React, { Component } from 'react'

import Validator from 'react-fields-validator'

class MyValidator extends Validator {
  
  isPasswordError = 'Пароль слишком короткий'

  isPassword(value) {
    const isValid = String(value).length >= 8;
    return isValid;
  }
}

class Example extends Component {
  state = {
    login: '',
    password: ''
  }
  
  onChange(ev) {
    this.setState({ 
      [ev.target.name]: ev.target.value
    });
  }
  
  onSubmit(ev) {
    ev.preventDefault();

    if (!this.onValidateForm.panic()) {
      fetch('http://google.com', {
	      method: "POST",
	      body: JSON.stringify({
		      test: 1
	      })
      });
    }
    
    return false;
  }
  
  onValidateForm() {}
  
  render () {
    return (
      <form>
        <MyValidator 
          value={this.state.value}
          validators={['isRequired']}
          onValidateForm={this.onValidateForm}
          render={(value, hasError, messages) => (
            <input type="text" name="login" value={value} onChange={(ev) => this.onChange(ev)}/>
          )}
        />
        <MyValidator 
          value={this.state.value}
          validators={['isRequired', 'isPassword']}
          onValidateForm={this.onValidateForm}
          isRequiredError="Необходимо заполнить это поле"
          render={(value, hasError, messages) => (
            <div>
              <input 
                type="password" 
                name="password" 
                value={value} 
                onChange={(ev) => this.onChange(ev)}
              />
              {hasError && (
                <span className="error">{messages[0]}</span>
              )}
            </div>
          )}
        />
        <button type="submit" />
      </form>
    )
  }
}
```
