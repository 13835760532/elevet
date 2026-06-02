import re

with open('src/views/filing/product/productDetail.vue', 'r') as f:
    content = f.read()

# We need to extract the parts and fix them.
# Our new template was already inserted, but it left the garbage from line 160 to somewhere before <script setup>.
# Let's find the new </template> that we inserted.
# The new </template> is right before line 160.
# The <script setup> is where the script begins.
# Let's just remove everything between our new </template> and <script setup>.

start_idx = content.find('</template>') + len('</template>\n')
script_idx = content.find('<script setup>')

if start_idx != -1 and script_idx != -1 and script_idx > start_idx:
    # Delete the garbage in between
    content = content[:start_idx] + "\n" + content[script_idx:]

    with open('src/views/filing/product/productDetail.vue', 'w') as f:
        f.write(content)
        print("Fixed!")
else:
    print("Could not find boundaries")
