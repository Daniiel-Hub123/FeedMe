"""
Simulate a large campaign with 15 users submitting feedback of varying quality.
"""
import urllib.request
import json
import time
import sys

API_URL = "http://127.0.0.1:8003/api"

USERS = [
    # Top quality
    {
        "name": "Lucia M. (Product Manager)",
        "wallet": "0x" + "11" * 20,
        "feedback": "La plataforma cumple excelente con el caso de uso DeFi. La conexión con MetaMask es instántanea gracias al Provider de ethers v6, pero noté que los modales modales de transacciòn fallida carecen de información clara. Los toast notifications deberían incluir el hash de la block explorer para seguimiento. Todo el diseño tipográfico y contrastes con WCAG 2.1 AA son impecables."
    },
    {
        "name": "Julian R. (Senior Dev)",
        "wallet": "0x" + "12" * 20,
        "feedback": "Gran interfaz de usuario. Sin embargo, hay un problema de State Management en el dashboard. Cuando cambias de red en la wallet, el UI tarda 4 segundos en reflejar el nuevo balance. Recomiendo usar react-query o wagmi hooks para suscribirse a los eventos de la chain (`accountsChanged`, `chainChanged`). Por lo demás, la jerarquía visual de los componentes de inversión es perfecta."
    },
    {
        "name": "Carla F. (UX Researcher)",
        "wallet": "0x" + "13" * 20,
        "feedback": "Excelente uso de los principios gestálticos de proximidad y similitud en la vista de portafolio. Las gráficas de dona comunican muy bien la distribución de assets. Sin embargo, la acción principal de 'Deposit' compite visualmente con el botón de 'Withdraw'. Recomiendo usar un botón primario sólido y uno secundario tipo outline para mejorar la affordance."
    },
    
    # Good quality
    {
        "name": "Andres P. (Usuario Crypto)",
        "wallet": "0x" + "21" * 20,
        "feedback": "Me gusta mucho cómo se ve la app, los colores oscuros combinan muy bien con los gradientes. Pero me costó encontrar la sección donde puedo ver mis tokens anteriores. El menú lateral debería estar siempre visible en pantallas grandes en lugar de ocultarse como hamburguesa."
    },
    {
        "name": "Dani G. (Trader)",
        "wallet": "0x" + "22" * 20,
        "feedback": "La app funciona muy rápido y la interfaz es súper clara para comprar y vender. Un detalle: el tamaño de la letra de los precios es muy pequeño en la versión móvil, lo que dificulta seguir el mercado cuando vas en el auto. Además, el dark mode no se activa automáticamente según mis preferencias del sistema."
    },
    {
        "name": "Maria C. (Estudiante UX)",
        "wallet": "0x" + "23" * 20,
        "feedback": "La estética general es muy buena, me recuerda a Binance pero más limpio. Noté que faltan tooltips en los iconos de las gráficas, lo que asume que todos sabemos para qué sirve cada botón. También, los mensajes de error cuando ingresas mal un monto podrían tener un tono más amigable."
    },
    
    # Average / Low quality
    {
        "name": "Juan D. (Nuevo en crypto)",
        "wallet": "0x" + "31" * 20,
        "feedback": "La verdad está muy buena la página. Los botones son grandes y se entiende todo. Solo que a veces me pierdo un poco entre tantas opciones."
    },
    {
        "name": "Sofia L.",
        "wallet": "0x" + "32" * 20,
        "feedback": "Me encanta el fondo de pantalla y los colores. Todo se ve muy bonito y moderno."
    },
    {
        "name": "Miguel A.",
        "wallet": "0x" + "33" * 20,
        "feedback": "La verdad me gustó mucho todo el diseño, es muy fácil de usar."
    },
    
    # Poor / Spam / Short
    {
        "name": "Bot 1",
        "wallet": "0x" + "41" * 20,
        "feedback": "Excelente página la recomiendo mucho buen trabajo."
    },
    {
        "name": "Bot 2",
        "wallet": "0x" + "42" * 20,
        "feedback": "Nice."
    },
    {
        "name": "Troll",
        "wallet": "0x" + "43" * 20,
        "feedback": "Esta página está horrible no sirve para nada y me estafaron."
    },

    # Off-topic
    {
        "name": "Roberto H.",
        "wallet": "0x" + "51" * 20,
        "feedback": "Alguien me puede explicar cómo configurar el RPC de Avalanche en MetaMask? Mi computadora no prende a veces."
    },
    {
        "name": "Pepe G. (QA)",
        "wallet": "0x" + "52" * 20,
        "feedback": "El formulario de login se rompe si pongo 500 caracteres en la contraseña y la API tira error 500."
    },
    {
        "name": "Crypto Bro",
        "wallet": "0x" + "53" * 20,
        "feedback": "COMPREN $DOGE HOY A LA LUNA!!! 🚀🚀🚀 La mejor cripto para hacerse millonarios!!"
    }
]

def api(method, path, data=None):
    req = urllib.request.Request(f"{API_URL}{path}", method=method)
    if data:
        req.data = json.dumps(data).encode("utf-8")
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}: {e.read().decode()}")
        return None
    except Exception as e:
        print(f"  ERROR de conexión: {e}")
        return None


def main():
    print("=" * 65)
    print("  FEEDME — SIMULACION DE MEGA CAMPANA PARA HACKATHON")
    print(f"  {len(USERS)} usuarios interactuando...")
    print("=" * 65)

    # 1. Check API health
    print("\n[0] Verificando que backend port 8003 responda...")
    health = api("GET", "/campaigns/")
    if health is None:
        print("El backend en 8003 no está corriendo. Intentar puerto 8002 o levantarlo.")
        return

    # 2. Create campaign
    print(f"\n[1] Creando campaña 'Mega Hackathon Final Demo'...")
    camp = api("POST", "/campaigns/", {
        "title": "Mega Hackathon Final Demo",
        "description": "Campaña gigante con 15 feedbacks para probar la resiliencia y escalabilidad de los Agentes IA en vivo.",
        "creator_wallet": "0x" + "ff" * 20,
        "aspects": [
            {"name": "Diseño UI y UX"},
        ],
        "tier1_amount": 250,
        "tier2_amount": 100,
        "tier3_amount": 50,
        "duration_days": 10,
    })
    if not camp:
        print("  ERROR: No se pudo crear la campana")
        return
    camp_id = camp["id"]
    aspect = camp["aspects"][0]
    print(f"  Campana: {camp['title']}")
    print(f"  ID: {camp_id}")
    print(f"  Deposit: {camp['total_deposit']} USDC")
    print(f"  Aspecto: {aspect['name']}")

    # 3. Generate codes
    print(f"\n[2] Generando {len(USERS)} códigos...")
    codes = api("POST", f"/campaigns/{camp_id}/codes", {"quantity": len(USERS)})
    if not codes:
        return

    # 4. Submit feedback for each user
    print(f"\n[3] Enviando feedback de {len(USERS)} usuarios en tiempo real...")
    print("    (Llamando a LangGraph LLMs - Esto tomará un tiempo)\n")

    results = []
    for i, user in enumerate(USERS):
        code = codes[i]["code"]
        words = len(user["feedback"].split())
        print(f"  [{i+1}/{len(USERS)}] {user['name']} ({words} palabras)...", end="", flush=True)

        start = time.time()
        result = api("POST", "/feedback/", {
            "wallet": user["wallet"],
            "campaign_id": camp_id,
            "aspect_id": aspect["id"],
            "code": code,
            "text": user["feedback"],
        })
        elapsed = time.time() - start

        if result:
            score = result.get("total_score", 0)
            status = result.get("status", "?")
            print(f" \t-> Score: {score}/100 | {status} | {elapsed:.1f}s")
            results.append({
                "name": user["name"],
                "score": score,
                "status": status,
                "justification": result.get("justification", ""),
            })
        else:
            print(f" \t-> ERROR al enviar feedback")

    # 5. Show ranking
    print("\n[4] Finalizando y repartiendo premios...")
    finalized = api("POST", f"/campaigns/{camp_id}/finalize")
    
    if not finalized:
        print("  ERROR al finalizar la campaña")
        return

    print("\n" + "=" * 65)
    print("  RANKING FINAL Y DISTRIBUCIÓN DE USDC")
    print("=" * 65)
    
    for w in finalized.get("winners", []):
        print(f"  {w['tier']:10s} | Score: {w['score']:3d} | Premio: {w['amount_usdc']:5.1f} USDC | {w['wallet']}")

    print("\n" + "=" * 65)
    print("  MEGA SIMULACION COMPLETADA CON EXITO")
    print("=" * 65)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
