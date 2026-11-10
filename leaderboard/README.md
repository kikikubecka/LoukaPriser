# 🌍 Online žebříček – server zdarma za 5 minut

Rekordy se ukládají na **Google Apps Script + Google Tabulku** – je to bezplatné, bez API klíčů a běží to na Googlem serveru. Hra pak ukazuje globální žebříček všech hráčů na všech zařízeních.

## Krok za krokem

1. **Vytvoř Tabulku**: otevři [sheets.new](https://sheets.new) a pojmenuj ji třeba *Louka příšer – žebříček*.
2. **Otevři Apps Script**: v Tabulce *Rozšíření → Apps Script*.
3. **Vlož backend**: smaž obsah `Code.gs`, vlož celý obsah souboru [`leaderboard/Code.gs`](./Code.gs) a ulož.
4. **Nasaď webovou aplikaci**: *Nasadit → Nové nasazení → Vybrat typ (ozubené kolo ⚙️) → Webová aplikace*:
   - **Spustit jako**: *Já* (tvůj účet)
   - **Kdo má přístup**: **Kdokoli** ❓ (důležité – jinak hra ze serveru nedostane data)
5. **Autorizuj**: přihlaš se účtem; u varování „Neověřená aplikace“ zvol *Rozšířené → Přejít na... (nebezpečné)* – je to tvůj vlastní skript, varování je standardní.
6. **Zkopíruj URL**: po nasazení se ukáže URL končící na `/exec`.
7. **Vlož URL do hry**: v `src/game.tsx` i v `index.html` najdi řádek `const LB_API = "";` a vlož URL mezi uvozovky. Nebo pošli URL přímo v chatu a jà ji tam vložím a pushnu.
8. **Otestuj**: otevři URL s příponou `?op=top` – vrátí `{"ok":true,"rows":[]}`. Pak hraj run, zapiš skóre a v menu na tabu 🥇 by měl svítit 🌍 *Sdílený žebříček*.

## Jak to funguje

- Hra posílá skóre při zápisu do žebříčku (`op=submit`) a při otevření tabu žebříčku stahuje top 50 (`op=top`; zobrazuje se jich 20).
- Při prvním úspěšném spojení hra **jednorázově nahraje staré lokální rekordy**, aby se neztratily.
- Bez nastaveného `LB_API` nebo při výpadku sítě hra běží dál na lokálním žebříčku jako dřív – nic se nerozbije.
- Server čistí data: jméno max 12 tisknutelných znaků, čísla se zaokrouhlují do rozumných mezí, Tabulka drží jen top 500 záznamů.

## Poznámky

- Žábříček je **veřejný** – kdokoli zná URL může poslat skóre (jako u klasických arkád). Data si můžeš kdykoliv prohlížet přímo v Tabulce – je to i záloha.
- Kvóty Apps Scriptu jsou pro hru tohoto rozsahu víc než dost (desetitisíce requestů denně).
- Aktualizace backendu: v Apps Scriptu uprav kód a pak u existujícího nasazení zvol *⚙️ Spravovat nasazení → Upravit → Nová verze* (URL zůstává stejná).
