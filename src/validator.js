import React from 'react'
import PropTypes from 'prop-types'
import ValidatorCore from './validator.core'

export default class Validator extends ValidatorCore {
  isRequiredError = 'This field is required';
  isTextError = 'Value is not a string';
  isNumberError = 'Value is not a number';
  isUrlPathError = 'Value is not a path';
  isUrlError = 'Value is not a url';
  isEmailError = 'Value is not a email';

  isRequired(value) {
    return Boolean(value)
  }

  isText(value) {
    return typeof value === 'string'
  }

  isNumber(value) {
    value = Number(value)
    return typeof value === 'number' && !isNaN(value)
  }

  isUrl(value) {
    value = String(value)
    const reg = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[а-яa-z0-9]+([\-\.]{1}[а-яa-z0-9]+)*\.[а-яa-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm
    return value.match(reg)
  }

  isUrlPath(value) {
    value = String(value)
    const reg = /^(\/)([\w\-\.]+[^#?\s]+)([\w\-]*)?(#[\w\-]+)?$/g
    return value.match(reg)
  }

  isEmail(value) {
    value = String(value)
    const reg = /^[\d\w]+[\w\d._-]*@([\w\d-_]+\.)+[\w]{2,}$/i
    return value.match(reg)
  }

  isEq(value, compareValue) {
    return String(value) === String(compareValue)
  }

  lengthGtEq(value, compareValue) {
    value = String(value)
    compareValue = Number(compareValue)
    return value.length >= compareValue
  }
}
