import os
from os.path import join as join_path, abspath

from jinja2 import FileSystemLoader, Environment

SRC_DIR = os.path.dirname(__file__)
HTML_DIR = join_path(".", "html")


def renderTemplate(file_location:str, search_path:str=HTML_DIR, out_name:str=None, template_args={}):
    out_name = file_location if (out_name is None) else out_name

    templateLoader = FileSystemLoader(searchpath=search_path)
    templateEnv = Environment(loader=templateLoader)
    template = templateEnv.get_template(file_location)
    outputText = template.render(**template_args)

    with open(join_path("..", out_name), "w+") as f:
        f.write(outputText)


# Render Home Page
renderTemplate("raytracerPage1.html", out_name="index.html")

# Render Other Pages
renderTemplate("raytracerPage1.html")
renderTemplate("raytracerPage2.html")
renderTemplate("raytracerPage3.html")
renderTemplate("raytracerPage4.html")
renderTemplate("rayTracerFinalReport.html")

