import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Sidebar({ isOpen, toggleSidebar }) {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button onClick={toggleSidebar}>☰</button> {/* Hamburger */}
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/repair-form">แจ้งซ่อม</Link>
        <Link to="/history">ประวัติ</Link>
        <Link to="/profile">Profile</Link>
      </nav>
    </div>
  )
}