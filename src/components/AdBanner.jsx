import { useEffect } from 'react';

/**
 * Componente para mostrar anuncios de Google AdSense
 * @param {string} slot - El ID del slot del anuncio (data-ad-slot)
 * @param {string} format - Formato del anuncio ('auto', 'horizontal', 'vertical', 'rectangle')
 * @param {boolean} responsive - Si el anuncio debe ser responsive
 * @param {object} style - Estilos adicionales para el contenedor
 */
export default function AdBanner({
    slot,
    format = 'auto',
    responsive = true,
    style = {},
    className = ''
}) {
    useEffect(() => {
        // Función para intentar cargar el anuncio
        const loadAd = () => {
            try {
                // Verificar si el contenedor tiene ancho > 0
                const ads = document.querySelectorAll(`ins[data-ad-slot="${slot}"]`);
                const currentAd = ads[ads.length - 1]; // Obtener el último renderizado (el actual)

                if (currentAd && currentAd.offsetWidth > 0) {
                    // Solo cargar si no tiene el atributo data-ad-status (evita duplicados)
                    if (!currentAd.getAttribute('data-ad-status')) {
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                    }
                }
            } catch (error) {
                console.error('Error loading AdSense ad:', error);
            }
        };

        // Intentar cargar inmediatamente
        loadAd();

        // También intentar cargar después de un pequeño delay para asegurar renderizado
        const timer = setTimeout(loadAd, 500);

        return () => clearTimeout(timer);
    }, [slot]); // Dependencia slot para recargar si cambia

    return (
        <div
            className={`ad-banner-container ${className}`}
            style={{
                textAlign: 'center',
                margin: '20px 0',
                minHeight: '90px',
                width: '100%', // Asegurar que ocupe ancho
                display: 'flex', // Ayuda con el layout
                justifyContent: 'center',
                alignItems: 'center',
                ...style
            }}
        >
            <ins
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
