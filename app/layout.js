export const metadata = {
  title: 'MD Jamil Contractor',
  description: 'Workforce Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif', backgroundColor: '#f3f4f6' }}>
        {children}
      </body>
    </html>
  )
}
