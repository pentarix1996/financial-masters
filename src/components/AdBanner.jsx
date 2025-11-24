import { useEffect, useRef, useState } from 'react';

/**
 * Componente para mostrar anuncios de Google AdSense
 * Utiliza IntersectionObserver para cargar anuncios solo cuando son visibles (Lazy Loading)
 * Esto previene errores de "width=0" y llamadas duplicadas.
 */
export default function AdBanner({
    slot,
    format = 'auto',
    responsive = true,
    style = {},
    className = ''
}) {
    const adRef = useRef(null);
    const [adLoaded, setAdLoaded] = useState(false);

    useEffect(() => {
        // Si ya se cargó o no hay referencia, salir
        if (adLoaded || !adRef.current) return;

        // Crear un observador para detectar cuando el anuncio es visible
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];

            // Solo cargar si es visible (isIntersecting) y tiene tamaño real
            if (entry.isIntersecting && entry.target.offsetWidth > 0) {
                try {
                    // Verificar una última vez si ya tiene el atributo data-ad-status
                    // (AdSense lo añade automáticamente cuando carga)
                    if (!adRef.current.getAttribute('data-ad-status')) {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                        setAdLoaded(true); // Marcar como cargado para no reintentar
                    }
                } catch (error) {
                    console.error('AdSense error:', error);
                }

                // Una vez cargado, ya no necesitamos observar
                observer.disconnect();
            }
        }, {
            root: null, // viewport
            threshold: 0.01 // Disparar apenas sea 1% visible
        });

        observer.observe(adRef.current);

        return () => {
            if (observer) observer.disconnect();
        };
    }, [slot, adLoaded]);

    return (
        <div
            className={`ad-banner-container ${className}`}
            style={{
                textAlign: 'center',
                margin: '20px 0',
                minHeight: '90px',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                ...style
            }}
        >
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block', width: '100%' }}
                data-ad-client="ca-pub-6148697034768001"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive.toString()}
            />
        </div>
    );
}
