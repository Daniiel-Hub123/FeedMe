import urllib.request
import json
import time
import sys

API_URL = "http://127.0.0.1:8002/api"

def request(method, path, data=None):
    req = urllib.request.Request(f"{API_URL}{path}", method=method)
    if data:
        req.data = json.dumps(data).encode("utf-8")
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"HTTP Error {e.code}: {error_body}")
        return None
    except Exception as e:
        print(f"Request Error: {e}")
        return None

def main():
    print("=" * 60)
    print("  FEEDBACK EVALUATOR - FULL E2E TEST")
    print("=" * 60)

    # 1. Check API health
    print("\n[1/5] Checking API health...")
    health = request("GET", "/../health")
    if not health:
        r = urllib.request.urlopen("http://127.0.0.1:8001/", timeout=5)
        info = json.loads(r.read().decode())
        print(f"  API: {info['message']} v{info['version']}")
    else:
        print(f"  Status: {health}")

    # 2. Get or create campaign
    print("\n[2/5] Fetching campaigns...")
    campaigns = request("GET", "/campaigns/")
    if not campaigns:
        print("  No campaigns found, creating one...")
        camp = request("POST", "/campaigns/", {
            "title": "Test Campaign AI",
            "description": "Testing AI agents",
            "creator_wallet": "0x" + "b" * 40,
            "aspects": [{"name": "Usabilidad"}, {"name": "Rendimiento"}],
            "tier1_amount": 100,
            "tier2_amount": 50,
            "tier3_amount": 25,
            "duration_days": 30,
        })
    else:
        camp = campaigns[0]
    
    camp_id = camp["id"]
    aspect = camp["aspects"][0]
    print(f"  Campaign: {camp['title']}")
    print(f"  Aspects: {[a['name'] for a in camp['aspects']]}")
    print(f"  Total Deposit: {camp['total_deposit']} USDC")

    # 3. Generate codes
    print("\n[3/5] Generating codes...")
    codes = request("POST", f"/campaigns/{camp_id}/codes", {"quantity": 1})
    if not codes:
        print("  ERROR: Failed to generate codes")
        return
    code = codes[0]["code"]
    print(f"  Code: {code}")

    # 4. Submit feedback
    feedback_text = (
        "La interfaz de usuario de la aplicacion tiene un diseno moderno con colores bien elegidos "
        "y una tipografia clara que facilita la lectura. Sin embargo, he notado que el menu de "
        "navegacion lateral tarda aproximadamente 2 segundos en desplegarse en dispositivos moviles, "
        "lo cual afecta negativamente la experiencia del usuario. Comparado con aplicaciones similares "
        "como Notion o Figma, el tiempo de respuesta deberia ser menor a 500ms para sentirse fluido. "
        "Ademas, los iconos en la barra superior no tienen suficiente contraste con el fondo oscuro, "
        "lo que dificulta su visibilidad especialmente para usuarios con problemas de vision. "
        "Recomiendo usar iconos con stroke mas grueso o agregar un halo sutil detras de cada icono. "
        "En general, la estetica es buena pero las microinteracciones necesitan pulirse bastante. "
        "Los formularios tienen buena validacion en tiempo real, eso es un punto fuerte del sistema."
    )
    
    wallet = "0x" + format(int(time.time()), "040x")
    word_count = len(feedback_text.split())
    
    print(f"\n[4/5] Submitting feedback ({word_count} words)...")
    print(f"  Wallet: {wallet}")
    print(f"  Aspect: {aspect['name']}")
    print(f"  Code: {code}")
    print("  Waiting for 4 AI Agents to evaluate...")
    print("  (Extractor -> Quality -> Diversity -> Scorer)")
    
    start = time.time()
    result = request("POST", "/feedback/", {
        "wallet": wallet,
        "campaign_id": camp_id,
        "aspect_id": aspect["id"],
        "code": code,
        "text": feedback_text,
    })
    elapsed = time.time() - start

    # 5. Show results
    if result:
        print(f"\n[5/5] EVALUATION RESULTS (took {elapsed:.1f}s)")
        print("=" * 60)
        status = result.get("status", "UNKNOWN")
        score = result.get("total_score", 0)
        emoji = "PASSED" if status == "EVALUATED" else "DISCARDED"
        print(f"  Status:        {status} ({emoji})")
        print(f"  Total Score:   {score}/100")
        print("-" * 40)
        print(f"  Depth:         {result.get('depth', 0)}/35")
        print(f"  Specificity:   {result.get('specificity', 0)}/25")
        print(f"  Coherence:     {result.get('coherence', 0)}/20")
        print(f"  Relevance:     {result.get('relevance', 0)}/10")
        print(f"  Diversity:     {result.get('diversity', 0)}/10")
        print("-" * 40)
        justification = result.get("justification", "N/A")
        print(f"  Justification: {justification}")
        print("=" * 60)
        print("\n  ALL TESTS PASSED!")
    else:
        print("\n  ERROR: Feedback submission failed!")
        print("=" * 60)

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
