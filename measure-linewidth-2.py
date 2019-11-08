# coding: utf-8
#from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont, QFontMetrics
from PyQt5.QtWidgets import QApplication

import sys

#for some reason QApplication needs to be up for this to work.
app = QApplication(sys.argv)
font = QFont("Times New Roman",12)
fontMetrics = QFontMetrics(font)

bullets = {
    'i\'s': 'iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii',
    '2006 spaces': '                                                                                                                                                                                                                                                                                               ',
    '2009 spaces': '                                                                                                                                                                                                                                              ',
    'normal bullet': "- Oversaw F-16 rdr vulnerability eval; mitigated sys interference issue--shielded air-to-air threat ID capes f/$25.6B fleet"
}
DPI = 90 #this is guesstimated
formWidthMM = 202.321 #this is extracted from the form
IPMM = 1/25.4 # this is a widely accepted standard
formWidthPx = formWidthMM*IPMM*DPI
print(f'form width: {formWidthPx}')

for label,bullet in bullets.items():
    width = fontMetrics.width(bullet)   
    print(f'width of {label}: {width}')

