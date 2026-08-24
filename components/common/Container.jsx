const Container = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`
        mx-auto
        w-full
        max-w-[1440px]

        px-4
        sm:px-6
        md:px-8
        lg:px-10
        xl:px-8

        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default Container