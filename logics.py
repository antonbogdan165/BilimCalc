SO_WEIGHT   = 25
SOR_WEIGHT  = 25
SOCH_WEIGHT = 50
SO_MAX_SCORE = 10


def calculate_parts(so: list, sors: list = None, soch: tuple = None) -> tuple:
    total_so = None
    if so:
        avg_so = sum(so) / len(so)
        total_so = (avg_so / SO_MAX_SCORE) * SO_WEIGHT

    sor_percentages = []
    if sors:
        for dialed, maximum in sors:
            if maximum != 0:
                sor_percentages.append(dialed / maximum * 100)

    total_sor = None
    if sor_percentages:
        avg_sor_pct = sum(sor_percentages) / len(sor_percentages)
        total_sor = (avg_sor_pct / 100) * SOR_WEIGHT

    total_soch = None
    if soch:
        dialed, maximum = soch
        if maximum != 0:
            total_soch = (dialed / maximum) * SOCH_WEIGHT

    return total_so, total_sor, total_soch


def calculate_final(total_so: float, total_sor: float, total_soch: float) -> float:
    if total_so is not None and total_sor is not None and total_soch is not None:
        return round(total_so + total_sor + total_soch, 4)
    elif total_so is not None and total_sor is not None:
        return round((total_so + total_sor) * 2, 4)
    elif total_so is not None:
        return round(total_so * 4, 4)
    return None