from PySide2 import QtGui


print('asdf')


font = QtGui.QFont("times",24)
fontMetrics = QtGui.QFontMetrics(font)
pixelsWide = fontMetrics.boundingRect('hello world!!!!!!!!!!!!!!')

