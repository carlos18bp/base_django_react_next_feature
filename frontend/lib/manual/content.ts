import { BookOpen } from 'lucide-react';

import type { ManualSection } from './types';

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'getting-started',
    title: { es: 'Primeros pasos', en: 'Getting started' },
    icon: BookOpen,
    processes: [
      {
        id: 'home-page',
        title: { es: 'Conoce la página de inicio', en: 'Tour the home page' },
        summary: {
          es: 'Descubre qué encontrarás al abrir la tienda por primera vez.',
          en: 'Find out what you will see when you first open the shop.',
        },
        why: {
          es: 'La página de inicio es el punto de entrada y te orienta hacia las secciones principales.',
          en: 'The home page is the entry point and guides you to the main sections.',
        },
        steps: {
          es: [
            'Abre la URL raíz del sitio en tu navegador.',
            'Observa el encabezado con los enlaces de navegación.',
            'Revisa los banners y contenido destacado.',
            'Desplázate hacia abajo para ver las secciones promocionales.',
            'Usa el menú superior para ir a catálogo, blogs o carrito.',
          ],
          en: [
            'Open the site root URL in your browser.',
            'Notice the header with the main navigation links.',
            'Review the hero banners and featured content.',
            'Scroll down to explore the promotional sections.',
            'Use the top menu to jump to catalog, blogs, or cart.',
          ],
        },
        route: '/',
        tips: {
          es: [
            'Si el contenido no carga, revisa tu conexión a internet.',
            'Puedes cambiar el idioma desde el selector de idioma.',
          ],
          en: [
            'If content does not load, check your internet connection.',
            'You can switch language from the locale selector.',
          ],
        },
        keywords: [
          'home',
          'inicio',
          'landing',
          'principal',
          'welcome',
          'bienvenida',
          'tour',
          'start',
        ],
      },
      {
        id: 'browse-catalog',
        title: { es: 'Explora el catálogo', en: 'Browse the catalog' },
        summary: {
          es: 'Navega todos los productos disponibles y filtra lo que te interesa.',
          en: 'Navigate all available products and filter what you need.',
        },
        why: {
          es: 'El catálogo es donde descubres productos antes de agregarlos al carrito.',
          en: 'The catalog is where you discover products before adding them to the cart.',
        },
        steps: {
          es: [
            'Haz clic en el enlace "Catalog" en el encabezado.',
            'Desplázate para ver la lista de productos.',
            'Usa los filtros para afinar los resultados.',
            'Haz clic en un producto para ver su detalle.',
            'Revisa fotos, descripción y precio en la vista de detalle.',
          ],
          en: [
            'Click the "Catalog" link in the header.',
            'Scroll through the list of products.',
            'Use the filters to narrow down the results.',
            'Click any product to open its detail view.',
            'Review photos, description, and price on the detail page.',
          ],
        },
        route: '/catalog',
        tips: {
          es: [
            'Algunos productos pueden estar agotados; el botón se mostrará deshabilitado.',
          ],
          en: ['Some products may be out of stock; the button will appear disabled.'],
        },
        keywords: [
          'catalog',
          'catálogo',
          'products',
          'productos',
          'browse',
          'buscar',
          'filter',
          'filtros',
          'listing',
          'listado',
        ],
      },
      {
        id: 'checkout-flow',
        title: { es: 'Agrega al carrito y paga', en: 'Add to cart and check out' },
        summary: {
          es: 'Completa tu compra desde el carrito hasta confirmar la orden.',
          en: 'Complete your purchase from the cart to order confirmation.',
        },
        why: {
          es: 'Comprender el flujo de pago asegura que tus pedidos se registren correctamente.',
          en: 'Understanding the checkout flow ensures your orders are placed correctly.',
        },
        steps: {
          es: [
            'Desde un producto, presiona "Agregar al carrito".',
            'Abre el carrito desde el encabezado.',
            'Revisa los artículos, cantidades y el total.',
            'Presiona "Checkout" para comenzar el pago.',
            'Completa los datos solicitados y confirma la orden.',
            'Espera la pantalla de confirmación antes de cerrar la página.',
          ],
          en: [
            'From a product page, press "Add to cart".',
            'Open the cart from the header.',
            'Review items, quantities, and total.',
            'Press "Checkout" to begin payment.',
            'Complete the requested details and confirm the order.',
            'Wait for the confirmation screen before closing the page.',
          ],
        },
        route: '/checkout',
        tips: {
          es: [
            'Puedes ajustar cantidades directamente en el carrito.',
            'Si cierras la pestaña sin confirmar, la orden no se registra.',
          ],
          en: [
            'You can adjust quantities directly in the cart.',
            'If you close the tab without confirming, the order will not be placed.',
          ],
        },
        keywords: [
          'cart',
          'carrito',
          'checkout',
          'pago',
          'order',
          'orden',
          'payment',
          'compra',
          'buy',
          'finalizar',
        ],
      },
    ],
  },
];
