"""
NyaySetu — IPC to BNS Section Mapping
======================================
Comprehensive mapping from Indian Penal Code (IPC, 1860) sections
to Bharatiya Nyaya Sanhita (BNS, 2023) sections.

This mapping is maintained separately for clarity and easy updates.
"""

# fmt: off
IPC_TO_BNS: dict[str, dict] = {
    # ── Offences Affecting the Human Body ──────────────────────────
    "299": {"bns": "100", "title": "Culpable homicide",
            "description": "Causing death with intention or knowledge"},
    "300": {"bns": "101", "title": "Murder",
            "description": "Culpable homicide amounting to murder"},
    "302": {"bns": "101", "title": "Punishment for murder",
            "description": "Death or imprisonment for life + fine"},
    "304": {"bns": "105", "title": "Culpable homicide not amounting to murder",
            "description": "Punishment for culpable homicide not amounting to murder"},
    "304A": {"bns": "106", "title": "Death by negligence",
            "description": "Causing death by rash or negligent act"},
    "304B": {"bns": "80",  "title": "Dowry death",
            "description": "Death of woman within 7 years of marriage under suspicious circumstances"},
    "306": {"bns": "108", "title": "Abetment of suicide",
            "description": "Abetting the commission of suicide"},
    "307": {"bns": "109", "title": "Attempt to murder",
            "description": "Attempt to commit murder"},
    "308": {"bns": "110", "title": "Attempt to commit culpable homicide",
            "description": "Attempt to commit culpable homicide not amounting to murder"},

    # ── Hurt & Grievous Hurt ───────────────────────────────────────
    "319": {"bns": "114", "title": "Hurt",
            "description": "Causing bodily pain, disease, or infirmity"},
    "320": {"bns": "114", "title": "Grievous hurt",
            "description": "Designated types of severe bodily harm"},
    "321": {"bns": "115", "title": "Voluntarily causing hurt",
            "description": "Intentionally causing hurt to any person"},
    "322": {"bns": "115", "title": "Voluntarily causing grievous hurt",
            "description": "Intentionally causing grievous hurt"},
    "323": {"bns": "115", "title": "Punishment for voluntarily causing hurt",
            "description": "Imprisonment up to 1 year or fine or both"},
    "324": {"bns": "118", "title": "Voluntarily causing hurt by dangerous weapons",
            "description": "Hurt by means of dangerous weapons or substances"},
    "325": {"bns": "117", "title": "Punishment for voluntarily causing grievous hurt",
            "description": "Imprisonment up to 7 years + fine"},
    "326": {"bns": "118", "title": "Voluntarily causing grievous hurt by dangerous weapons",
            "description": "Grievous hurt by means of dangerous weapons"},

    # ── Kidnapping & Abduction ─────────────────────────────────────
    "359": {"bns": "135", "title": "Kidnapping",
            "description": "Kidnapping from India or from lawful guardianship"},
    "362": {"bns": "137", "title": "Abduction",
            "description": "Compelling or inducing a person to go from any place"},
    "363": {"bns": "137", "title": "Punishment for kidnapping",
            "description": "Imprisonment up to 7 years + fine"},
    "364": {"bns": "138", "title": "Kidnapping for murder",
            "description": "Kidnapping in order to murder"},
    "364A": {"bns": "140", "title": "Kidnapping for ransom",
            "description": "Kidnapping for ransom, etc."},
    "366": {"bns": "139", "title": "Kidnapping woman to compel marriage",
            "description": "Kidnapping, abducting, or inducing woman to marriage"},

    # ── Sexual Offences ────────────────────────────────────────────
    "375": {"bns": "63",  "title": "Rape",
            "description": "Definition and elements of rape"},
    "376": {"bns": "64",  "title": "Punishment for rape",
            "description": "Rigorous imprisonment not less than 10 years"},
    "376A": {"bns": "66", "title": "Rape causing death or persistent vegetative state",
            "description": "RI not less than 20 years or death"},
    "376AB": {"bns": "65", "title": "Rape of woman under 12 years",
             "description": "RI not less than 20 years, may extend to life or death"},
    "376D": {"bns": "70",  "title": "Gang rape",
            "description": "Woman raped by one or more persons constituting a group"},
    "354": {"bns": "74",  "title": "Assault on woman with intent to outrage modesty",
            "description": "Assault or criminal force on woman to outrage her modesty"},
    "354A": {"bns": "75", "title": "Sexual harassment",
            "description": "Physical contact, demand for sexual favours, showing pornography, making sexually coloured remarks"},
    "354B": {"bns": "76", "title": "Assault with intent to disrobe",
            "description": "Assault or use of criminal force to disrobe woman"},
    "354C": {"bns": "77", "title": "Voyeurism",
            "description": "Watching or capturing image of woman in private act"},
    "354D": {"bns": "78", "title": "Stalking",
            "description": "Following, contacting, or monitoring a woman"},

    # ── Theft, Robbery, Dacoity ────────────────────────────────────
    "378": {"bns": "303", "title": "Theft",
            "description": "Dishonestly taking movable property out of possession"},
    "379": {"bns": "303", "title": "Punishment for theft",
            "description": "Imprisonment up to 3 years or fine or both"},
    "380": {"bns": "305", "title": "Theft in dwelling house",
            "description": "Theft in any building used as human dwelling"},
    "384": {"bns": "308", "title": "Punishment for extortion",
            "description": "Imprisonment up to 3 years or fine or both"},
    "390": {"bns": "309", "title": "Robbery",
            "description": "Theft + hurt/fear = robbery"},
    "391": {"bns": "310", "title": "Dacoity",
            "description": "When 5+ persons conjointly commit robbery"},
    "392": {"bns": "309", "title": "Punishment for robbery",
            "description": "RI up to 10 years + fine"},
    "395": {"bns": "310", "title": "Punishment for dacoity",
            "description": "Imprisonment for life or RI up to 10 years + fine"},
    "397": {"bns": "311", "title": "Robbery or dacoity with attempt to cause death",
            "description": "RI not less than 7 years"},

    # ── Cheating & Fraud ───────────────────────────────────────────
    "415": {"bns": "318", "title": "Cheating",
            "description": "Deceiving any person thereby dishonestly inducing"},
    "417": {"bns": "318", "title": "Punishment for cheating",
            "description": "Imprisonment up to 1 year or fine or both"},
    "419": {"bns": "319", "title": "Cheating by personation",
            "description": "Cheating by pretending to be some other person"},
    "420": {"bns": "316", "title": "Cheating and dishonestly inducing delivery of property",
            "description": "Imprisonment up to 7 years + fine"},
    "463": {"bns": "336", "title": "Forgery",
            "description": "Making a false document with intent to cause damage"},
    "467": {"bns": "338", "title": "Forgery of valuable security",
            "description": "Forgery of valuable security, will, or authority"},
    "468": {"bns": "339", "title": "Forgery for purpose of cheating",
            "description": "Forgery for the purpose of cheating"},
    "471": {"bns": "340", "title": "Using forged document as genuine",
            "description": "Fraudulently or dishonestly using forged document"},

    # ── Criminal Breach of Trust ───────────────────────────────────
    "405": {"bns": "316", "title": "Criminal breach of trust",
            "description": "Dishonest misappropriation or conversion of property entrusted"},
    "406": {"bns": "316", "title": "Punishment for criminal breach of trust",
            "description": "Imprisonment up to 3 years or fine or both"},
    "409": {"bns": "316", "title": "Criminal breach of trust by public servant",
            "description": "Imprisonment up to life or up to 10 years + fine"},

    # ── Criminal Intimidation & Defamation ─────────────────────────
    "499": {"bns": "356", "title": "Defamation",
            "description": "Imputation harming reputation by words, signs, or visible representations"},
    "500": {"bns": "356", "title": "Punishment for defamation",
            "description": "Simple imprisonment up to 2 years or fine or both"},
    "503": {"bns": "351", "title": "Criminal intimidation",
            "description": "Threatening injury to person, reputation, or property"},
    "506": {"bns": "351", "title": "Punishment for criminal intimidation",
            "description": "Imprisonment up to 2 years or fine or both"},
    "507": {"bns": "352", "title": "Criminal intimidation by anonymous communication",
            "description": "Imprisonment up to 2 years in addition to sec 506"},

    # ── Offences Against the State & Public Tranquility ────────────
    "121": {"bns": "147", "title": "Waging war against the Government of India",
            "description": "Death or imprisonment for life + fine"},
    "124A": {"bns": "152", "title": "Sedition (now acts endangering sovereignty)",
            "description": "Acts endangering sovereignty, unity, and integrity of India"},
    "141": {"bns": "189", "title": "Unlawful assembly",
            "description": "Assembly of 5+ persons with common object"},
    "143": {"bns": "189", "title": "Punishment for unlawful assembly",
            "description": "Imprisonment up to 6 months or fine or both"},
    "147": {"bns": "191", "title": "Punishment for rioting",
            "description": "Imprisonment up to 2 years or fine or both"},
    "148": {"bns": "191", "title": "Rioting armed with deadly weapon",
            "description": "Imprisonment up to 3 years or fine or both"},
    "153A": {"bns": "196", "title": "Promoting enmity between groups",
            "description": "Promoting enmity on grounds of religion, race, etc."},

    # ── Offences by Public Servants ────────────────────────────────
    "161": {"bns": "201", "title": "Public servant taking gratification",
            "description": "Now covered under Prevention of Corruption Act + BNS"},
    "166": {"bns": "202", "title": "Public servant disobeying law",
            "description": "Public servant disobeying direction of law with intent to cause injury"},
    "167": {"bns": "203", "title": "Public servant framing incorrect document",
            "description": "Framing or translating incorrect document to cause injury"},

    # ── Cruelty & Domestic Violence ────────────────────────────────
    "498A": {"bns": "85",  "title": "Cruelty by husband or relatives",
            "description": "Husband or relative of husband subjecting woman to cruelty"},

    # ── Offences Against Property (Mischief, Trespass) ─────────────
    "425": {"bns": "324", "title": "Mischief",
            "description": "Causing wrongful loss or damage to property"},
    "426": {"bns": "324", "title": "Punishment for mischief",
            "description": "Imprisonment up to 3 months or fine or both"},
    "427": {"bns": "325", "title": "Mischief causing damage >= ₹50",
            "description": "Imprisonment up to 2 years or fine or both"},
    "441": {"bns": "329", "title": "Criminal trespass",
            "description": "Entering property in possession of another with intent to commit offence"},
    "447": {"bns": "329", "title": "Punishment for criminal trespass",
            "description": "Imprisonment up to 3 months or fine or both"},
    "448": {"bns": "330", "title": "House-trespass",
            "description": "Criminal trespass in a building used as human dwelling"},
    "449": {"bns": "331", "title": "House-trespass to commit offence punishable with death",
            "description": "Imprisonment for life or RI up to 10 years + fine"},
    "452": {"bns": "333", "title": "House-trespass after preparation for hurt",
            "description": "Imprisonment up to 7 years + fine"},

    # ── Offences Relating to Documents & Property Marks ────────────
    "403": {"bns": "314", "title": "Dishonest misappropriation of property",
            "description": "Dishonest misappropriation of movable property"},
    "411": {"bns": "317", "title": "Dishonestly receiving stolen property",
            "description": "Receiving property knowing it to be stolen"},

    # ── Attempt & Abetment ─────────────────────────────────────────
    "107": {"bns": "45",  "title": "Abetment of a thing",
            "description": "Instigating, engaging in conspiracy, or aiding"},
    "108": {"bns": "45",  "title": "Abettor",
            "description": "A person abets an offence who abets either the commission of an offence"},
    "109": {"bns": "49",  "title": "Punishment of abetment",
            "description": "Punishment for abetment if the act abetted is committed"},
    "120A": {"bns": "61", "title": "Definition of criminal conspiracy",
            "description": "Agreement of two or more persons to do an illegal act"},
    "120B": {"bns": "61", "title": "Punishment of criminal conspiracy",
            "description": "Same punishment as for abetment"},
    "511": {"bns": "62",  "title": "Punishment for attempting to commit offences",
            "description": "Attempt to commit offence punishable with imprisonment for life or otherwise"},

    # ── Miscellaneous Important Sections ───────────────────────────
    "34":  {"bns": "3(5)", "title": "Common intention",
            "description": "Acts done by several persons in furtherance of common intention"},
    "149": {"bns": "190",  "title": "Every member of unlawful assembly guilty of offence",
            "description": "Common object doctrine"},
    "295A": {"bns": "299", "title": "Deliberate acts to outrage religious feelings",
            "description": "Deliberate malicious acts intended to outrage religious feelings"},
    "279": {"bns": "281",  "title": "Rash driving on a public way",
            "description": "Driving rashly or negligently on a public way"},
    "509": {"bns": "79",   "title": "Word, gesture, or act intended to insult modesty of woman",
            "description": "Imprisonment up to 3 years + fine"},
}
# fmt: on


def get_ipc_section_info(ipc_section: str) -> dict | None:
    """
    Look up BNS equivalent for a given IPC section number.

    Args:
        ipc_section: IPC section number as string (e.g., "302", "304A", "376AB")

    Returns:
        dict with keys: ipc, bns, title, description — or None if not found.
    """
    cleaned = ipc_section.strip().upper()
    if cleaned in IPC_TO_BNS:
        entry = IPC_TO_BNS[cleaned]
        return {
            "ipc_section": cleaned,
            "bns_section": entry["bns"],
            "title": entry["title"],
            "description": entry["description"],
        }
    return None


def get_all_mappings() -> list[dict]:
    """Return the full IPC→BNS mapping as a list of dicts."""
    return [
        {
            "ipc_section": ipc,
            "bns_section": data["bns"],
            "title": data["title"],
            "description": data["description"],
        }
        for ipc, data in IPC_TO_BNS.items()
    ]
