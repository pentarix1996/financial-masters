import { useEffect, useRef } from 'react';

export default function AdBanner({
    slot,
    format = 'auto',
    responsive = true,
    style = {},
    className = ''
}) {
    const adRef = useRef(null);
    const initialized = useRef(false);

    useEffect(() => {
        // Evitamos doble ejecución en modo estricto de React o recargas rápidas
        if (initialized.current) return;

        // Verificamos que el contenedor tenga anchura antes de pedir el anuncio
        if (adRef.current && adRef.current.offsetWidth > 0) {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                initialized.current = true;
            } catch (e) {
                console.error("AdSense error", e);
            }
        }
    }, []); // El array vacío asegura que solo se ejecute una vez al montar

    return (
        <div
            className={`ad-banner-container ${className}`}
            style={{
                textAlign: 'center',
                margin: '20px 0',
                width: '100%',
                display: 'block', // Importante: block evita colapsos de flexbox
                minHeight: style.minHeight || '90px', // Reserva espacio para evitar saltos (CLS)
                ...style
            }}
        >
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-6148697034768001"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive.toString()}
            ></ins>
        </div>
    );
}