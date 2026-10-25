# KCE DELF B2 - Week 1 source. Built by /home/claude/delf/tools/build_week.py into /home/claude/kgh/delf-b2/week01.html
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from w01_part1 import META, WELCOME, LEXICON, GRAMMAR
from w01_part2 import CO1, CO2, CO3
from w01_part3 import CE1, CE2, CE3, PE, PO, BILAN

DATA = dict(META)
DATA["screens"] = [WELCOME, LEXICON, GRAMMAR, CO1, CO2, CO3, CE1, CE2, CE3, PE, PO, BILAN]
SEED = 101  # seed for answer-position shuffling (change only to re-balance)
