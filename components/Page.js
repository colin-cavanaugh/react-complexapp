import React, { useEffect } from 'react'
import Container from './Container'

function Page(props) {
  useEffect(() => {
    document.title = `${props.title} | ComplexApp`
    window.scrollTo(0, 0)
  }, [props.title]) // renders everytime title changes
  return <Container wide={props.wide}>{props.children}</Container>
}
export default Page
