import css from './tip.module.css'
interface Itip {
  text: string
}
function Tip(props: Itip) {
  const {text} = props
  return <div className={css.tipBox}>{text}</div>
}

export default Tip
