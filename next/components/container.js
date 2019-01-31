const Container = props => (
  <div {...props}>
    {props.children}
    <style jsx>{`
      padding: 20px;
    `}</style>
  </div>
)

export default Container
