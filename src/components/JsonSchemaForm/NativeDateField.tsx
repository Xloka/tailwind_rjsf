import React from 'react'
import Text from './Text'
import { Props } from '../../type'

const NativeDateField = (props: Props) => {
  const {
    value,
    form,
    type
  } = props
  return (
    <Text
      {...props}
      form={{ ...form, type }}
      value={value}
      otherProps={{ InputLabelProps: { shrink: true } }}
      {...form.otherProps}
    />
  )
}

export default NativeDateField