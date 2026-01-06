const Typography = ({ children, ...extraProps }) => {
  return (
    <p {...extraProps} className={'ts' + ' ' + (extraProps ? extraProps.className : '')}>
      {children}
    </p>
  )
}

export default Typography
