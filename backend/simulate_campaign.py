"""
Simulate a real campaign with 5 users submitting feedback of varying quality.
Each user gets evaluated by the 4 AI agents and receives a score.
"""
import urllib.request
import json
import time
import sys

API_URL = "http://127.0.0.1:8002/api"

USERS = [
    {
        "name": "Ana Garcia (Experta UX)",
        "wallet": "0x" + "a1" * 20,
        "feedback": (
            "La interfaz presenta un diseño visual moderno con buena jerarquía tipográfica. "
            "Sin embargo, identifiqué tres problemas críticos de usabilidad: primero, el menú "
            "de navegación lateral tiene un delay de 1.8 segundos al desplegarse en móviles, "
            "comparado con los 300ms que recomienda Nielsen Norman Group. Segundo, los botones "
            "de acción principal (CTA) usan un azul #3B82F6 que tiene ratio de contraste 3.2:1 "
            "contra el fondo, cuando WCAG AA exige mínimo 4.5:1. Tercero, el flujo de checkout "
            "requiere 7 pasos cuando podría consolidarse en 3 usando progressive disclosure. "
            "Recomiendo implementar skeleton screens durante la carga y agregar feedback háptico "
            "en las interacciones táctiles. La arquitectura de información es sólida pero los "
            "microcopys de los formularios necesitan revisión para reducir la carga cognitiva."
        ),
    },
    {
        "name": "Carlos Mendez (Dev Frontend)",
        "wallet": "0x" + "b2" * 20,
        "feedback": (
            "El rendimiento de la aplicación es aceptable en desktop pero tiene problemas serios "
            "en dispositivos móviles. Medí un Time to Interactive de 4.2 segundos en un Moto G "
            "con 4G, cuando debería ser menor a 3 segundos según Core Web Vitals. El Largest "
            "Contentful Paint es de 3.8 segundos por culpa de imágenes sin lazy loading. "
            "Recomiendo usar next/image con blur placeholder. El bundle de JavaScript es de 450KB "
            "comprimido, se puede reducir a 280KB con tree shaking y code splitting por ruta. "
            "Los formularios validan correctamente en tiempo real, eso es un punto muy positivo "
            "que mejora la tasa de conversión."
        ),
    },
    {
        "name": "Maria Lopez (Diseñadora)",
        "wallet": "0x" + "c3" * 20,
        "feedback": (
            "El diseño cumple con los estándares modernos de UI. Los colores principales "
            "transmiten profesionalismo y la tipografía Inter es legible. Noté que el espaciado "
            "entre secciones es inconsistente, con 32px en unas partes y 48px en otras. "
            "Los iconos deberían tener un estilo unificado. En general se ve bien "
            "pero falta pulir la consistencia visual."
        ),
    },
    {
        "name": "Pedro Ruiz (QA Tester)",
        "wallet": "0x" + "d4" * 20,
        "feedback": (
            "Encontré varios bugs. El formulario de registro acepta emails sin arroba, "
            "el botón de enviar se puede clickear doble y manda duplicados. En Safari "
            "el modal se posiciona mal. También el footer se corta en pantallas pequeñas."
        ),
    },
    {
        "name": "Luis Torres (Usuario casual)",
        "wallet": "0x" + "e5" * 20,
        "feedback": (
            "La pagina esta bonita me gusto el diseño y los colores "
            "se ve muy profesional y moderna todo funciona bien."
        ),
    },
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


def main():
    print("=" * 65)
    print("  FEEDBACK EVALUATOR — SIMULACION DE CAMPANA REAL")
    print("  5 usuarios con feedback de diferente calidad")
    print("=" * 65)

    # 1. Create campaign
    print("\n[1] Creando campana 'UX Review App Financiera'...")
    camp = api("POST", "/campaigns/", {
        "title": "UX Review App Financiera",
        "description": "Evaluacion de la experiencia de usuario de nuestra app de finanzas personales",
        "creator_wallet": "0x" + "ff" * 20,
        "aspects": [
            {"name": "Diseno UI"},
            {"name": "Rendimiento"},
        ],
        "tier1_amount": 100,
        "tier2_amount": 50,
        "tier3_amount": 25,
        "duration_days": 7,
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

    # 2. Generate codes
    print(f"\n[2] Generando {len(USERS)} codigos...")
    codes = api("POST", f"/campaigns/{camp_id}/codes", {"quantity": len(USERS)})
    if not codes:
        return
    for i, c in enumerate(codes):
        print(f"  {USERS[i]['name']:35s} -> {c['code']}")

    # 3. Submit feedback for each user
    print(f"\n[3] Enviando feedback de {len(USERS)} usuarios...")
    print("    (Cada uno es evaluado por 4 agentes IA)\n")

    results = []
    for i, user in enumerate(USERS):
        code = codes[i]["code"]
        words = len(user["feedback"].split())
        print(f"  [{i+1}/{len(USERS)}] {user['name']} ({words} palabras)...")

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
            print(f"       Score: {score}/100 | Status: {status} | {elapsed:.1f}s")
            results.append({
                "name": user["name"],
                "score": score,
                "depth": result.get("depth", 0),
                "specificity": result.get("specificity", 0),
                "coherence": result.get("coherence", 0),
                "relevance": result.get("relevance", 0),
                "diversity": result.get("diversity", 0),
                "justification": result.get("justification", ""),
            })
        else:
            print(f"       ERROR al enviar feedback")
            results.append({"name": user["name"], "score": 0})

    # 4. Show ranking
    results.sort(key=lambda x: x["score"], reverse=True)

    print("\n" + "=" * 65)
    print("  RANKING FINAL")
    print("=" * 65)
    medals = ["🥇", "🥈", "🥉", "  ", "  "]
    tiers = ["TIER 1 ($100)", "TIER 2 ($50)", "TIER 3 ($25)", "---", "---"]

    for i, r in enumerate(results):
        bar = "#" * (r["score"] // 2)
        print(f"  {medals[i]} {r['name']:35s} {r['score']:3d}/100  {tiers[i]}")
        print(f"      D:{r.get('depth',0):2d} S:{r.get('specificity',0):2d} "
              f"C:{r.get('coherence',0):2d} R:{r.get('relevance',0):2d} "
              f"Div:{r.get('diversity',0):2d}  [{bar}]")

    print("\n" + "=" * 65)
    print("  JUSTIFICACIONES DE LOS AGENTES IA")
    print("=" * 65)
    for i, r in enumerate(results):
        just = r.get("justification", "N/A")
        if just and len(just) > 200:
            just = just[:200] + "..."
        print(f"\n  {medals[i]} {r['name']}:")
        print(f"     {just}")

    print("\n" + "=" * 65)
    print("  SIMULACION COMPLETADA!")
    print("=" * 65)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
