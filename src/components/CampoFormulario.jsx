// Campo con etiqueta en mayúsculas pequeñas, como en el diseño.
export default function CampoFormulario({ id, etiqueta, error, como = 'input', children, ...props }) {
  const Elemento = como
  return (
    <div className="campo">
      <label htmlFor={id} className="etiqueta">
        {etiqueta}
      </label>
      <Elemento
        id={id}
        name={id}
        className="entrada"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {children}
      </Elemento>
      {error && (
        <p id={`${id}-error`} className="campo-error">
          {error}
        </p>
      )}
    </div>
  )
}
