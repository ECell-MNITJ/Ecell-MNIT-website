export default function ESummitAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Top-level layout for admin just passes through children
    // Sub-layouts in (auth) and (protected) specific groups handle UI
    return (
        <>
            {children}
        </>
    );
}
