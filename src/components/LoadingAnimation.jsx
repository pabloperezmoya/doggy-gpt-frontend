import '../styles/LoadingAnimation.scss'
const LoadingAnimation = () => {  
  return (
    <div className="loading-dots">
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
    </div>
  )}

const CircleLoadingAnimation = () => {
  return <div className="loader"></div>
}

export { LoadingAnimation, CircleLoadingAnimation }