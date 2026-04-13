import Header from './components/Header'
import SocialLinks from './components/SocialLinks'
import FAQ from './components/FAQ'
import ProxyList from './components/ProxyList'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <main className="container">
        <SocialLinks />
        <div className="divider" />
        <FAQ />
        <div className="divider" />
        <ProxyList />
      </main>
      <Footer />
    </>
  )
}

export default App
