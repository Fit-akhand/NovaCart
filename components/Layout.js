import React from 'react'
import NavBar from './NavBar'
import Notify from './Notify'
import Modal from './Modal'

function Layout({ children }) {
  return (
    <div className="min-w-0 w-full">
      <NavBar />
      <Notify />
      <Modal />
      <div className="min-w-0 w-full">{children}</div>
    </div>
  )
}

export default Layout
