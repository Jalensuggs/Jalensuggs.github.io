import Sidebar from './Sidebar'
import RightPanel from './RightPanel'

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-col">{children}</main>
      <RightPanel />
    </div>
  )
}
