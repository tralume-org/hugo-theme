+++
# Default archetype for new content.

# Title from filename (kebab-case -> Title Case).
title = '{{ replace .File.ContentBaseName "-" " " | title }}'

# Creation time.
date = '{{ .Date }}'

# Last modified time (init = creation time).
lastmod = '{{ .Date }}'

# New pages start as drafts.
draft = true

# Optional metadata.
description = ""
tags = []
license = ""

# Optional: Agent metadata.
# [ai]
#  level = "none"
#  review = "none"
#  usage = []
#  tools = []
+++
