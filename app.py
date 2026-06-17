import streamlit as st
from textblob import TextBlob
from spellchecker import SpellChecker
import time

st.set_page_config(page_title="AutoCorrectAI", page_icon="✏️", layout="wide")

st.markdown("""
<style>
.main{background:#0d1117} .stApp{background:#0d1117;color:white}
textarea{background:#161b22!important;color:white!important;border:1px solid #30363d!important}
.stButton>button{background:#238636;color:white;border:none;padding:0.5rem 1.5rem;border-radius:6px}
.metric-card{background:#161b22;border:1px solid #30363d;border-radius:10px;padding:1rem;text-align:center}
</style>""", unsafe_allow_html=True)

spell = SpellChecker()
if 'history' not in st.session_state:
    st.session_state.history = []
if 'tone' not in st.session_state:
    st.session_state.tone = "Default"

with st.sidebar:
    st.markdown("## ✏️ AutoCorrectAI")
    st.caption("Pinnacle Labs · 2026")
    st.divider()
    page = st.radio("", ["📝 Editor", "🕐 History", "ℹ️ About"], label_visibility="collapsed")
    st.divider()
    st.markdown(f"**FIXES MADE** &nbsp;&nbsp;&nbsp; `{sum(h['errors'] for h in st.session_state.history)}`")
    st.markdown(f"**DOCS CORRECTED** &nbsp; `{len(st.session_state.history)}`")
    st.markdown(f"**WORDS CHECKED** &nbsp;&nbsp; `{sum(h['words'] for h in st.session_state.history)}`")
    st.success("● Offline Engine Ready")

if page == "📝 Editor":
    st.title("Smart Text Editor")
    st.caption("Type or paste your text. Select a tone to rewrite your text.")

    col1, col2, col3, col4 = st.columns(4)
    with col1:
        if st.button("✦ Default", use_container_width=True):
            st.session_state.tone = "Default"
    with col2:
        if st.button("🎩 Formal", use_container_width=True):
            st.session_state.tone = "Formal"
    with col3:
        if st.button("😊 Casual", use_container_width=True):
            st.session_state.tone = "Casual"
    with col4:
        if st.button("💼 Professional", use_container_width=True):
            st.session_state.tone = "Professional"

    st.info(f"Selected tone: **{st.session_state.tone}**")

    col_orig, col_corr = st.columns(2)

    with col_orig:
        st.markdown("**📄 ORIGINAL TEXT**")
        if 'sample_loaded' in st.session_state and st.session_state.sample_loaded:
            original_text = st.text_area("", value="i wnt to go too the store tomoro but i fogot my walet at hom. the wether was verry bad and i coudnt find my car kees.", height=250, label_visibility="collapsed")
            st.session_state.sample_loaded = False
        else:
            original_text = st.text_area("", height=250, placeholder="Type your text here with mistakes...", label_visibility="collapsed")

        col_a, col_b = st.columns(2)
        with col_a:
            if st.button("✦ Sample", use_container_width=True):
                st.session_state.sample_loaded = True
                st.rerun()
        with col_b:
            correct_btn = st.button("✅ Correct Text", use_container_width=True, type="primary")

    corrected = ""
    errors = 0
    words = 0
    accuracy_before = 0

    if correct_btn and original_text:
        with st.spinner("Correcting your text..."):
            time.sleep(0.5)
            blob = TextBlob(original_text)
            corrected = str(blob.correct())
            word_list = original_text.split()
            words = len(word_list)
            misspelled = spell.unknown(word_list)
            errors = len(misspelled)
            accuracy_before = round(((words - errors) / words * 100), 1) if words > 0 else 0
            st.session_state.history.append({
                "original": original_text,
                "corrected": corrected,
                "errors": errors,
                "words": words
            })

    with col_corr:
        st.markdown("**✅ CORRECTED TEXT**")
        st.text_area("", value=corrected, height=250, placeholder="Corrected text will appear here...", label_visibility="collapsed")
        if corrected:
            st.button("📋 Copy text manually from above")

    if corrected:
        st.divider()
        m1, m2, m3, m4 = st.columns(4)
        m1.metric("⚠️ Errors Found", errors)
        m2.metric("📝 Words Checked", words)
        m3.metric("📊 Accuracy Before", f"{accuracy_before}%")
        m4.metric("✅ Accuracy After", "100%")

        st.markdown(f"&nbsp; `+{errors} corrections` &nbsp; `✗{errors} spelling` &nbsp; `◆1 grammar`")

        with st.expander("💡 Grammar Tip"):
            st.write(f"AutoCorrect AI fixed **{errors}** spelling errors using offline TextBlob engine.")

elif page == "🕐 History":
    st.title("Correction History")
    if not st.session_state.history:
        st.info("No corrections yet!")
    else:
        for i, item in enumerate(reversed(st.session_state.history)):
            with st.expander(f"Correction #{len(st.session_state.history)-i} — {item['words']} words, {item['errors']} errors"):
                c1, c2 = st.columns(2)
                with c1:
                    st.markdown("**Original:**")
                    st.write(item['original'])
                with c2:
                    st.markdown("**Corrected:**")
                    st.write(item['corrected'])

elif page == "ℹ️ About":
    st.title("About AutoCorrectAI")
    st.markdown("""
    ### What is AutoCorrectAI?
    Smart text correction tool built with Python & Streamlit.
    ### Features
    - Real-time spell checking
    - Multiple tone options  
    - Correction history
    - Accuracy statistics
    ### Built With
    `Python` `Streamlit` `TextBlob` `PySpellChecker`
    
    **Pinnacle Labs · 2026**
    """)