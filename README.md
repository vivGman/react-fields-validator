# react-fields-validator

> 

[![NPM](https://img.shields.io/npm/v/react-fields-validator.svg)](https://www.npmjs.com/package/react-fields-validator) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Установка

```bash
npm install --save react-fields-validator
```

## Использование

```jsx
import React, { Component } from 'react'

import Validator from 'react-fields-validator'

class Example extends Component {
  state = {
    value: ''
  }
  
  onChange(ev) {
    this.setState({ 
      value: ev.target.value
    });
  }
  
  render () {
    return (
      <Validator 
        value={this.state.value}
        validators={['isRequired']}
        render={(value, hasError, messages) => (
          <input type="text" value={value} onChange={(ev) => this.onChange(ev)}/>
        )}
      />
    )
  }
}
```

## Примеры использования


[Валидация формы](https://github.com/vivGman/react-fields-validator/blob/master/docs/validation-form.md)

[Нестандартные валидации](https://github.com/vivGman/react-fields-validator/blob/master/docs/custom-validations.md)

## License

MIT © [vivGman](https://github.com/vivGman)
