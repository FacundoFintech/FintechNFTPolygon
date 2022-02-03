const Page = ({children,id="default-page",title="Page Title"}) => {
    return (
        <div className="page" id={id}> 
            <header className="page-header">
                <h1>{title}</h1>
            </header>
            <section className="page-section">
                {children}
            </section>
        </div>
    )
}

export default Page
