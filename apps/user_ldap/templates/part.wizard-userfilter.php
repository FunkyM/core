<fieldset id="ldapWizard2">
	<div>
		<p>
			<?php p($l->t('Limit %s access to users meeting these criteria:', $theme->getName()));?>
		</p>
		<p>
			<label for="ldap_userfilter_objectclass">
				<?php p($l->t('Only these object classes:'));?>
			</label>

			<select id="ldap_userfilter_objectclass" multiple="multiple"
			 name="ldap_userfilter_objectclass">
			</select>
		</p>
		<p>
			<label></label>
			<span class="ldapInputColElement"><?php p($l->t('The most common object classes for users are organizationalPerson, person, user, and inetOrgPerson. If you are not sure which object class to select, please consult your directory admin.'));?></span>
		</p>
		<p>
			<label for="ldap_userfilter_groups">
				<?php p($l->t('Only from these groups:'));?>
			</label>

			<select id="ldap_userfilter_groups" multiple="multiple"
			 name="ldap_userfilter_groups">
			</select>
		</p>
		<p>
			<label><a id='toggleRawUserFilter' class='ldapToggle'>↓ <?php p($l->t('Edit LDAP Query'));?></a></label>
		</p>
		<p id="ldapReadOnlyUserFilterContainer" class="hidden ldapReadOnlyFilterContainer">
			<label><?php p($l->t('LDAP Filter:'));?></label>
			<span class="ldapFilterReadOnlyElement ldapInputColElement"></span>
		</p>
		<p id="rawUserFilterContainer">
			<input type="text" id="ldap_userlist_filter" name="ldap_userlist_filter"
			class="lwautosave ldapFilterInputElement"
			placeholder="<?php p($l->t('Edit LDAP Query'));?>"
			title="<?php p($l->t('The filter specifies which LDAP users shall have access to the %s instance.', $theme->getName()));?>"
			/>
		</p>
		<p>
			<div class="ldapWizardInfo invisible">&nbsp;</div>
		</p>
		<p class="ldap_count">
			<button class="ldapGetEntryCount ldapGetUserCount" name="ldapGetEntryCount" type="button">
				<?php p($l->t('Verify settings and count users'));?>
			</button>
			<span id="ldap_user_count"></span>
		</p>
		<?php print_unescaped($_['wizardControls']); ?>
	</div>
</fieldset>
