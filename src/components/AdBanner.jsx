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
        try {
            // Cargar el anuncio cuando el componente se monte
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
            console.error('Error loading AdSense ad:', error);
        }
    }, []);

    return (
        <div
            className={`ad-banner-container ${className}`}
            style={{
                textAlign: 'center',
                margin: '20px 0',
                minHeight: '90px',
                ...style
            }}
        >
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-6148697034768001"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive.toString()}
            />
        </div>
    );
}
