from PyQt5.QtCore import QPointF, QSize, Qt
from PyQt5.QtGui import QBrush, QFont, QFontMetrics, QPainter, QPainterPath,QLabel
from PyQt5.QtWidgets import QApplication, QComboBox, QGridLayout, QWidget


NoTransformation, Translate, Rotate, Scale = range(4)
class RenderArea(QWidget):
    def __init__(self, parent=None):
        super(RenderArea, self).__init__(parent)

        newFont = self.font()
        newFont.setPixelSize(12)
        newFont.setFamily("Times New Roman")
        self.setFont(newFont)

        fontMetrics = QFontMetrics(newFont)
        self.xBoundingRect = fontMetrics.boundingRect("x")
        self.yBoundingRect = fontMetrics.boundingRect("y")
        self.shape = QPainterPath()
        self.operations = []

class PdfWindow(QWidget):

    operationTable = (NoTransformation, Rotate, Scale, Translate)
    NumTransformedAreas = 3
    
    def __init__(self):
        super(PdfWindow, self).__init__()

        self.originalRenderArea = RenderArea()

        layout = QGridLayout()
        layout.addWidget(self.originalRenderArea, 0, 0)
        
        self.setLayout(layout)
        

        self.setWindowTitle("Adobe PDF Bullets Viewer")
        self.setGeometry(20,20,500,300)


if __name__ == '__main__':

    import sys

    app = QApplication(sys.argv)
    window = PdfWindow()
    window.show()
    sys.exit(app.exec_())


    

#font = PyQt5.QtGui.QFont("times",24)

#fontMetrics = PyQt5.QtGui.QFontMetrics(font)
#pixelsWide = fontMetrics.width('hello world!!!!!!!!!!!!!!')
#

