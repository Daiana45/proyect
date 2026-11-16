
export async function obtenerTiendas() {
    try {
        const respuesta = await fetch("/api/tiendas", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!respuesta.ok) {
            throw new Error(
                `Error al obtener las tiendas: ${respuesta.status}`
            );
        }

        const datos = await respuesta.json();

        if (!Array.isArray(datos)) {
            throw new Error(
                "La respuesta del servidor no contiene una lista de tiendas"
            );
        }

        return datos;

    } catch (error) {
        console.error("Error en tiendaService:", error);
        throw error;
    }
}
